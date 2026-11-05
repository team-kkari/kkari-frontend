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
import { isArchitectureJobActive, type LatestArchitectureJob } from '@/entities/recommendation'
import { ApiError } from '@/shared/api'
import { formatBudget, lacksBudgetCurrency } from '../lib/format'
import { missingLabelsOf } from '../lib/missing-fields'
import {
  CLOSING_MESSAGE,
  designFailedMessage,
  INFRA_INTRO,
  TERRAFORM_CHOICE,
  TERRAFORM_INTRO,
  TERRAFORM_UPLOADED_INTRO,
  terraformUploadedChoice,
} from './script'
import type { ChatMessage, CollectedInfo, ConnectResult } from './types'

type AiMessage = Extract<ChatMessage, { role: 'ai' }>

let localSeq = 0
const nextLocalId = () => `local-${++localSeq}`

const errorText = (e: unknown) =>
  e instanceof ApiError ? e.message : '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'

function toChatMessage(m: ChatMessageDto): ChatMessage {
  return m.role === 'USER'
    ? { id: `s${m.id}`, role: 'user', text: m.content }
    : {
        id: `s${m.id}`,
        role: 'ai',
        text: m.content,
        quickReplies: m.quickReplies?.length ? m.quickReplies : undefined,
      }
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

/** 백엔드가 고객사명으로 받아 주는 최대 길이 (공백 제외) */
const COMPANY_NAME_MAX_LENGTH = 100

interface UseConsultationOptions {
  project: ProjectDetail
  /** 시작 화면에서 입력한 첫 메시지. 대화 기록이 비어 있을 때만 보낸다 */
  firstMessage?: string
  /**
   * 상담에 들어올 때 서버가 알려 준 가장 최근 설계 작업. 진행 중이면 설계 화면으로 바로 이어 가고,
   * 실패했으면 확인 카드 앞에 안내를 붙인다. 열릴 때 한 번만 본다
   */
  designJob?: LatestArchitectureJob | null
}

/** 프로젝트 하나의 상담 상태. 대화는 서버가 기록하고, 인프라 연결·설계 확인 카드는 화면에서만 만든다 */
export function useConsultation({ project, firstMessage, designJob }: UseConsultationOptions) {
  const { projectId } = project
  const queryClient = useQueryClient()
  const history = useQuery(chatQueries.history(projectId))
  const [cards, setCards] = useState<ChatMessage[]>([])
  // 이미 진행 중인 설계 작업이 있으면 새로 시작하지 않고 그 작업을 이어서 본다
  const [resumeJobId] = useState(() =>
    isArchitectureJobActive(designJob) ? designJob?.jobId : undefined,
  )
  const [designing, setDesigning] = useState(resumeJobId !== undefined)
  // 마지막 설계 작업이 실패한 채로 열렸으면 그 사유 (진행 중이 아닐 때만 의미가 있다)
  const [failedDesign] = useState(() => (designJob?.status === 'FAILED' ? designJob : null))
  const [cardError, setCardError] = useState<string | null>(null)
  const [awsDone, setAwsDone] = useState(false)
  const [terraformDone, setTerraformDone] = useState(false)
  // 카드가 처음 붙은 시점의 서버 메시지 개수. 그 뒤에 오가는 대화는 카드 아래에 보여준다
  const [anchor, setAnchor] = useState(0)
  const cardsStarted = useRef(false)
  const chatStarted = useRef(false)
  const lastConfirmId = useRef<string | null>(null)
  // 서버가 고객사명으로 알고 있는 이름. 상담 중 바뀌면 목록·제목을 다시 불러온다
  const knownCompanyName = useRef(project.companyName)

  const send = useMutation({
    mutationFn: (content?: string) => sendChatMessage(projectId, content),
    onSuccess: (res) => {
      queryClient.setQueryData(chatQueries.history(projectId).queryKey, (prev) =>
        mergeResponse(prev, res),
      )
      // 백엔드가 profile.companyName 을 프로젝트 고객사명에 반영한다. 이름이 새로 바뀐 때만 사이드바 목록·제목을 갱신한다
      const companyName = res.profile?.companyName?.trim()
      if (
        companyName &&
        companyName.length <= COMPANY_NAME_MAX_LENGTH &&
        companyName !== knownCompanyName.current
      ) {
        knownCompanyName.current = companyName
        void queryClient.invalidateQueries({ queryKey: projectQueries.all() })
      }
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
    // 캐시에 남아 있던 낡은 기록(빈 목록)만 보고 첫 메시지를 또 보내지 않게, 마운트 뒤 최신 기록을 받은 다음에 판단한다
    if (!history.isSuccess || !history.isFetchedAfterMount || history.isFetching) return
    if (chatStarted.current || send.isPending) return
    if (history.data.messages.length > 0) {
      chatStarted.current = true
      return
    }
    chatStarted.current = true
    send.mutate(firstMessage)
  }, [
    history.isSuccess,
    history.isFetchedAfterMount,
    history.isFetching,
    history.data,
    firstMessage,
    send,
  ])

  const ready = history.data?.ready ?? false

  // AI 가 정보를 다 모으면 다음 단계 카드를 이어 붙인다. 이미 분석이 끝난 프로젝트는 바로 요약 카드
  useEffect(() => {
    if (!ready || cardsStarted.current || send.isPending) return
    cardsStarted.current = true
    setAnchor(
      queryClient.getQueryData(chatQueries.history(projectId).queryKey)?.messages.length ?? 0,
    )
    const analyzed = project.stage !== 'RECEIVED'
    // 이전 설계 요청이 실패한 채로 다시 열었으면 확인 카드 앞에 사유를 알려 준다
    const failedNotice: ChatMessage[] = failedDesign
      ? [{ id: nextLocalId(), role: 'ai', text: designFailedMessage(failedDesign.failureReason) }]
      : []
    setCards(
      analyzed
        ? [...failedNotice, { id: nextLocalId(), role: 'ai', text: CLOSING_MESSAGE, confirm: {} }]
        : [{ id: nextLocalId(), role: 'ai', text: INFRA_INTRO, connect: { kind: 'aws' } }],
    )
  }, [ready, send.isPending, project.stage, failedDesign, queryClient, projectId])

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
      // 이미 올려 둔 Terraform 파일이 있으면 그 파일 정보를 보여 주고 그대로 쓸지 묻는다
      const uploaded = project.terraformUploaded === true
      setCards((prev) => [
        ...prev,
        {
          id: nextLocalId(),
          role: 'ai',
          text: uploaded ? TERRAFORM_UPLOADED_INTRO : TERRAFORM_INTRO,
          choice: uploaded ? terraformUploadedChoice(project.terraform) : TERRAFORM_CHOICE,
        },
      ])
      return
    }
    if (kind === 'terraform') setTerraformDone(true)
    setCards((prev) => [
      ...prev,
      { id: nextLocalId(), role: 'ai', text: CLOSING_MESSAGE, confirm: {} },
    ])
  }

  /** Terraform 업로드 카드를 건너뛴다 (선택 입력이라 올리지 않아도 설계할 수 있다) */
  const skipConnect = (messageId: string) => {
    updateCard(messageId, (m) => (m.connect ? { ...m, connect: { ...m.connect, done: true } } : m))
    setCards((prev) => [
      ...prev,
      { id: nextLocalId(), role: 'ai', text: CLOSING_MESSAGE, confirm: {} },
    ])
  }

  const confirmDesign = (messageId: string) => {
    // 수정 요청을 보내는 중이면 갱신 전 요구사항이 저장되므로, 응답을 받은 뒤에 누르게 한다
    if (send.isPending || saveReq.isPending) return
    lastConfirmId.current = messageId
    setCardError(null)
    updateCard(messageId, (m) => (m.confirm ? { ...m, confirm: { done: true } } : m))
    saveReq.mutate(undefined, {
      onSuccess: () => setDesigning(true),
      onError: (e) => {
        // 양수 예산에 통화(USD/KRW)가 없으면 서버가 "입력값이 올바르지 않습니다" 로만 알려 줘서 원인을 덧붙인다
        const draft = history.data?.requirementsDraft
        const hint = lacksBudgetCurrency(draft?.monthlyBudget, draft?.currency)
          ? ' 월 예산의 통화(USD 또는 KRW)를 대화로 알려 주세요.'
          : ''
        setCardError(`요구사항을 저장하지 못했어요. ${errorText(e)}${hint}`)
        updateCard(messageId, (m) => (m.confirm ? { ...m, confirm: {} } : m))
      },
    })
  }

  const sendMessage = useCallback(
    (text: string) => {
      setCardError(null)
      send.mutate(text)
    },
    [send],
  )

  // 서버 기록 + 전송 중인 내 메시지 + 화면 카드
  const messages = useMemo<ChatMessage[]>(() => {
    const list = (history.data?.messages ?? []).map(toChatMessage)
    const after = list.slice(anchor)
    if (send.isPending && send.variables) {
      after.push({ id: 'pending-user', role: 'user', text: send.variables })
    }
    return [...list.slice(0, anchor), ...cards, ...after]
  }, [history.data, send.isPending, send.variables, cards, anchor])

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
        ? terraformDone || project.terraformUploaded === true
          ? 'AWS 계정 + Terraform'
          : 'AWS 계정 연결'
        : undefined,
    infraAnalysis: awsDone || project.stage !== 'RECEIVED' ? '완료' : undefined,
  }

  // 마지막 서버 메시지가 내 것이면 AI 응답이 비어 있는 것이다 (전송 실패)
  const serverMessages = history.data?.messages ?? []
  const lastServer = serverMessages[serverMessages.length - 1]
  const needsRetry = !send.isPending && !!lastServer && lastServer.role === 'USER'
  const retry = () => {
    if (cardError && lastConfirmId.current) {
      confirmDesign(lastConfirmId.current)
      return
    }
    setCardError(null)
    // 서버에 저장되지 못한 전송이 실패했으면 같은 내용을 다시 보내고, AI 응답만 실패했으면 응답만 다시 요청한다
    send.mutate(needsRetry ? undefined : send.variables)
  }
  const error =
    cardError ??
    (history.isError ? errorText(history.error) : null) ??
    (send.isError ? errorText(send.error) : null) ??
    (needsRetry ? 'AI 답변을 받지 못했어요.' : null)

  return {
    designing,
    /** 이어서 보는 설계 작업이 있으면 그 ID. 없으면 설계 화면이 새로 시작한다 */
    resumeJobId,
    loading: history.isPending,
    messages,
    info,
    /** 아직 못 모은 항목의 표시명 */
    missingLabels: missingLabelsOf(history.data),
    isAiTyping: send.isPending,
    canType,
    error,
    // 기록 조회가 실패했으면 다시 불러오고, 아니면 AI 응답만 다시 요청한다
    retry: history.isError ? () => void history.refetch() : retry,
    sendMessage,
    confirmChoice,
    completeConnect,
    skipConnect,
    confirmDesign,
  }
}
