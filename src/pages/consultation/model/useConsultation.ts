import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  chatQueries,
  PRIORITY_LABEL,
  saveRequirements,
  sendChatMessage,
  type ChatMessageDto,
  type ChatState,
  type Priority,
  type SendChatResponse,
} from '@/entities/chat'
import { projectQueries, type ProjectDetail } from '@/entities/project'
import { ApiError } from '@/shared/api'
import { CLOSING_MESSAGE, INFRA_INTRO, TERRAFORM_CHOICE, TERRAFORM_INTRO } from './script'
import type { ChatMessage, CollectedInfo, ConnectResult } from './types'

type AiMessage = Extract<ChatMessage, { role: 'ai' }>

let localSeq = 0
const nextLocalId = () => `local-${++localSeq}`

const errorText = (e: unknown) =>
  e instanceof ApiError ? e.message : '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'

function toChatMessage(m: ChatMessageDto): ChatMessage {
  return m.role === 'USER'
    ? { id: `s${m.id}`, role: 'user', text: m.content }
    : { id: `s${m.id}`, role: 'ai', text: m.content, quickReplies: m.quickReplies ?? undefined }
}

/** 전송 응답을 기록 캐시에 합친다 (같은 id 는 한 번만) */
function mergeResponse(prev: ChatState | undefined, res: SendChatResponse): ChatState {
  const known = new Set((prev?.messages ?? []).map((m) => m.id))
  const added = [res.userMessage, res.assistantMessage].filter(
    (m): m is ChatMessageDto => !!m && !known.has(m.id),
  )
  return {
    messages: [...(prev?.messages ?? []), ...added],
    missing: res.missing,
    missingFields: res.missingFields,
    ready: res.ready,
    profile: res.profile,
    requirementsDraft: res.requirementsDraft,
  }
}

function formatBudget(amount?: number | null, currency?: string | null) {
  if (amount === undefined || amount === null) return undefined
  if (amount === 0) return '예산 제한 없음'
  return `${amount.toLocaleString('ko-KR')} ${currency ?? ''}`.trim()
}

interface UseConsultationOptions {
  project: ProjectDetail
  /** 시작 화면에서 입력한 첫 메시지. 대화 기록이 비어 있을 때만 보낸다 */
  firstMessage?: string
}

/** 프로젝트 하나의 상담 상태. 대화는 서버가 기록하고, 인프라 연결·설계 확인 카드는 화면에서만 만든다 */
export function useConsultation({ project, firstMessage }: UseConsultationOptions) {
  const { projectId } = project
  const queryClient = useQueryClient()
  const history = useQuery(chatQueries.history(projectId))
  const [cards, setCards] = useState<ChatMessage[]>([])
  const [designing, setDesigning] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [awsDone, setAwsDone] = useState(false)
  const [terraformDone, setTerraformDone] = useState(false)
  const cardsStarted = useRef(false)
  const chatStarted = useRef(false)

  const send = useMutation({
    mutationFn: (content?: string) => sendChatMessage(projectId, content),
    onSuccess: (res) => {
      queryClient.setQueryData(chatQueries.history(projectId).queryKey, (prev) =>
        mergeResponse(prev, res),
      )
    },
    // 사용자 메시지는 저장됐는데 AI 응답만 실패했을 수 있어서 서버 기록으로 맞춘다
    onError: () =>
      void queryClient.invalidateQueries({ queryKey: chatQueries.history(projectId).queryKey }),
  })

  const saveReq = useMutation({
    mutationFn: () => {
      const draft = history.data?.requirementsDraft
      // 백엔드는 우선순위를 1개 이상 요구한다(빈 배열은 400). 초안이 없거나 비어 있으면 저장하지 않고 넘어간다
      if (!draft?.priorities?.length) return Promise.resolve(null)
      return saveRequirements(projectId, {
        ...draft,
        content: draft.content || history.data?.profile?.goal || project.companyName,
        containsPersonalData: draft.containsPersonalData ?? false,
      })
    },
  })

  // 대화 기록이 비어 있으면 AI 가 먼저 말을 걸게 한다 (시작 화면의 첫 메시지가 있으면 그걸로)
  useEffect(() => {
    if (!history.isSuccess || chatStarted.current || send.isPending) return
    if (history.data.messages.length > 0) {
      chatStarted.current = true
      return
    }
    chatStarted.current = true
    send.mutate(firstMessage)
  }, [history.isSuccess, history.data, firstMessage, send])

  const ready = history.data?.ready ?? false

  // AI 가 정보를 다 모으면 다음 단계 카드를 이어 붙인다. 이미 분석이 끝난 프로젝트는 바로 요약 카드
  useEffect(() => {
    if (!ready || cardsStarted.current || send.isPending) return
    cardsStarted.current = true
    const analyzed = project.stage !== 'RECEIVED'
    setCards(
      analyzed
        ? [{ id: nextLocalId(), role: 'ai', text: CLOSING_MESSAGE, confirm: {} }]
        : [{ id: nextLocalId(), role: 'ai', text: INFRA_INTRO, connect: { kind: 'aws' } }],
    )
  }, [ready, send.isPending, project.stage])

  const updateCard = (messageId: string, update: (m: AiMessage) => AiMessage) => {
    setCards((prev) => prev.map((m) => (m.id === messageId && m.role === 'ai' ? update(m) : m)))
  }

  const confirmChoice = (messageId: string, optionId: string) => {
    const target = cards.find((m) => m.id === messageId)
    if (target?.role !== 'ai' || !target.choice || target.choice.selectedId) return
    const option = target.choice.options.find((o) => o.id === optionId)
    if (!option) return
    updateCard(messageId, (m) =>
      m.choice ? { ...m, choice: { ...m.choice, selectedId: optionId } } : m,
    )
    const { followUp } = option
    if (!followUp) {
      // 건너뛰기: 바로 설계 확인으로 넘어간다
      setCards((prev) => [
        ...prev,
        { id: nextLocalId(), role: 'ai', text: CLOSING_MESSAGE, confirm: {} },
      ])
      return
    }
    setCards((prev) => [
      ...prev,
      {
        id: nextLocalId(),
        role: 'ai',
        text: followUp.message,
        connect: { kind: followUp.connect },
      },
    ])
  }

  const completeConnect = (messageId: string, _answerText: string, result: ConnectResult) => {
    const target = cards.find((m) => m.id === messageId)
    const kind = target?.role === 'ai' ? target.connect?.kind : undefined
    updateCard(messageId, (m) =>
      m.connect ? { ...m, connect: { ...m.connect, done: true, result } } : m,
    )
    // 분석으로 의뢰 단계가 바뀌었을 수 있다
    void queryClient.invalidateQueries({ queryKey: projectQueries.all() })
    if (kind === 'aws') {
      setAwsDone(true)
      setCards((prev) => [
        ...prev,
        { id: nextLocalId(), role: 'ai', text: TERRAFORM_INTRO, choice: TERRAFORM_CHOICE },
      ])
      return
    }
    if (kind === 'terraform') setTerraformDone(true)
    setCards((prev) => [
      ...prev,
      { id: nextLocalId(), role: 'ai', text: CLOSING_MESSAGE, confirm: {} },
    ])
  }

  const confirmDesign = (messageId: string) => {
    setCardError(null)
    updateCard(messageId, (m) => (m.confirm ? { ...m, confirm: { done: true } } : m))
    saveReq.mutate(undefined, {
      onSuccess: () => setDesigning(true),
      onError: (e) => {
        setCardError(`요구사항을 저장하지 못했어요. ${errorText(e)}`)
        updateCard(messageId, (m) => (m.confirm ? { ...m, confirm: {} } : m))
      },
    })
  }

  const sendMessage = useCallback((text: string) => send.mutate(text), [send])

  const retry = () => {
    setCardError(null)
    send.mutate(undefined)
  }

  // 서버 기록 + 전송 중인 내 메시지 + 화면 카드
  const messages = useMemo<ChatMessage[]>(() => {
    const list = (history.data?.messages ?? []).map(toChatMessage)
    if (send.isPending && send.variables) {
      list.push({ id: 'pending-user', role: 'user', text: send.variables })
    }
    return [...list, ...cards]
  }, [history.data, send.isPending, send.variables, cards])

  const lastCard = cards[cards.length - 1]
  const awaitingCard =
    lastCard?.role === 'ai' &&
    ((!!lastCard.choice && !lastCard.choice.selectedId) ||
      (!!lastCard.connect && !lastCard.connect.done))

  const canType = history.isSuccess && !send.isPending && !awaitingCard && !saveReq.isPending

  const profile = history.data?.profile
  const priorities = profile?.priorities?.map((p) => PRIORITY_LABEL[p as Priority] ?? p).join(' > ')
  const info: CollectedInfo = {
    customer: profile?.companyName || project.companyName,
    request: profile?.goal || profile?.workload || undefined,
    priority: priorities || undefined,
    budget: formatBudget(profile?.monthlyBudget, profile?.currency),
    infraConnection:
      awsDone || project.stage !== 'RECEIVED'
        ? terraformDone
          ? 'AWS 계정 + Terraform'
          : 'AWS 계정 연결'
        : undefined,
    infraAnalysis: awsDone || project.stage !== 'RECEIVED' ? '완료' : undefined,
  }

  // 마지막 서버 메시지가 내 것이면 AI 응답이 비어 있는 것이다 (전송 실패)
  const serverMessages = history.data?.messages ?? []
  const lastServer = serverMessages[serverMessages.length - 1]
  const needsRetry = !send.isPending && !!lastServer && lastServer.role === 'USER'
  const error =
    cardError ??
    (history.isError ? errorText(history.error) : null) ??
    (send.isError ? errorText(send.error) : null) ??
    (needsRetry ? 'AI 답변을 받지 못했어요.' : null)

  return {
    designing,
    loading: history.isPending,
    messages,
    info,
    isAiTyping: send.isPending,
    canType,
    error,
    // 기록 조회가 실패했으면 다시 불러오고, 아니면 AI 응답만 다시 요청한다
    retry: history.isError ? () => void history.refetch() : retry,
    sendMessage,
    confirmChoice,
    completeConnect,
    confirmDesign,
  }
}
