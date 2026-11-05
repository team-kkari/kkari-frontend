import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AI_DELAY,
  CLOSING_MESSAGE,
  EDIT_HELP_MESSAGE,
  INFO_ITEMS,
  SCRIPT,
  parseInfoEdit,
} from './script'
import type {
  ChatMessage,
  CollectedInfo,
  ConnectResult,
  ConsultationSnapshot,
  ConsultationStage,
} from './types'

let messageSeq = 0
const nextId = () => `m${++messageSeq}`

function aiMessage(stepIndex: number): ChatMessage {
  const step = SCRIPT[stepIndex]
  return {
    id: nextId(),
    role: 'ai',
    text: step.message,
    choice: step.choice,
    quickReplies: step.quickReplies,
  }
}

/** 마지막 글자의 받침 (한글이 아니면 null) */
function finalConsonant(word: string): number | null {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code <= 11171 ? code % 28 : null
}

/** 월 예산 → 월 예산을, 우선순위 → 우선순위를 */
const withObjectParticle = (word: string) => `${word}${finalConsonant(word) ? '을' : '를'}`

/** 250만 원 → 250만 원으로, 비용 → 비용으로, 서울 → 서울로 */
function withToParticle(word: string) {
  const consonant = finalConsonant(word)
  // 받침이 없거나 ㄹ 받침이면 '로'
  return `${word}${consonant && consonant !== 8 ? '으로' : '로'}`
}

/** 목업 시나리오로 의뢰 접수 화면의 상태를 관리한다 */
export function useConsultation(initial?: ConsultationSnapshot) {
  const [stage, setStage] = useState<ConsultationStage>(initial?.stage ?? 'start')
  const [messages, setMessages] = useState<ChatMessage[]>(initial?.messages ?? [])
  const [info, setInfo] = useState<CollectedInfo>(initial?.info ?? {})
  const [stepIndex, setStepIndex] = useState(initial?.stepIndex ?? 0)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const timers = useRef<number[]>([])

  const schedule = (fn: () => void, delay = AI_DELAY) => {
    timers.current.push(window.setTimeout(fn, delay))
  }

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }

  useEffect(() => clearTimers, [])

  const answer = useCallback(
    (text: string, appendUserMessage: boolean) => {
      const step = SCRIPT[stepIndex]
      if (!step || isAiTyping) return

      if (appendUserMessage) {
        setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
      }
      setInfo((prev) => ({ ...prev, ...step.collect(text) }))
      setIsAiTyping(true)

      const nextIndex = stepIndex + 1
      setStepIndex(nextIndex)

      if (nextIndex < SCRIPT.length) {
        schedule(() => {
          setMessages((prev) => [...prev, aiMessage(nextIndex)])
          setIsAiTyping(false)
        })
        return
      }

      // 다 모으면 요약을 보여주고, 사용자가 확인해야 설계를 시작한다
      schedule(() => {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'ai', text: CLOSING_MESSAGE, confirm: {} },
        ])
        setIsAiTyping(false)
      })
    },
    [stepIndex, isAiTyping],
  )

  /** 시작 화면에서 첫 메시지를 보낸다 */
  const start = (text: string) => {
    setMessages([aiMessage(0)])
    setStage('chat')
    answer(text, true)
  }

  // 마지막 AI 메시지가 선택지·연결·확인 카드를 기다리는 중인지
  const lastMessage = messages[messages.length - 1]
  const pendingConfirm =
    lastMessage?.role === 'ai' && !!lastMessage.confirm && !lastMessage.confirm.done
      ? lastMessage
      : undefined
  const awaitingCard =
    lastMessage?.role === 'ai' &&
    ((!!lastMessage.choice && !lastMessage.choice.selectedId) ||
      (!!lastMessage.connect && !lastMessage.connect.done))

  /**
   * 요약 카드가 떠 있을 때 채팅으로 고친다 ("예산 250만 원으로 바꿔줘").
   * 이전 카드는 그때 값으로 잠그고, 고친 내용으로 새 요약 카드를 보낸다.
   */
  const editSummary = (text: string) => {
    if (!pendingConfirm || isAiTyping) return
    const edit = parseInfoEdit(text)
    const nextInfo = edit ? { ...info, [edit.key]: edit.value } : info

    setMessages((prev) => [
      ...prev.map((m) =>
        m.id === pendingConfirm.id && m.role === 'ai' ? { ...m, confirm: { done: true, info } } : m,
      ),
      { id: nextId(), role: 'user', text },
    ])
    setIsAiTyping(true)

    schedule(() => {
      const label = edit && INFO_ITEMS.find((item) => item.key === edit.key)?.label
      const reply =
        edit && label
          ? `${withObjectParticle(label)} ${withToParticle(edit.value)} 바꿨어요. 이 내용으로 아키텍처를 설계할까요?`
          : EDIT_HELP_MESSAGE
      setInfo(nextInfo)
      setMessages((prev) => [...prev, { id: nextId(), role: 'ai', text: reply, confirm: {} }])
      setIsAiTyping(false)
    })
  }

  const sendMessage = (text: string) => (pendingConfirm ? editSummary(text) : answer(text, true))

  const updateAiMessage = (
    messageId: string,
    update: (message: Extract<ChatMessage, { role: 'ai' }>) => ChatMessage,
  ) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId && m.role === 'ai' ? update(m) : m)))
  }

  /** 선택지 카드에서 확인을 누른다 */
  const confirmChoice = (messageId: string, optionId: string) => {
    const target = messages.find((m) => m.id === messageId)
    if (target?.role !== 'ai' || !target.choice || target.choice.selectedId) return
    const option = target.choice.options.find((o) => o.id === optionId)
    if (!option) return

    updateAiMessage(messageId, (m) =>
      m.choice ? { ...m, choice: { ...m.choice, selectedId: optionId } } : m,
    )

    const { followUp } = option
    if (!followUp) {
      answer(option.label, false)
      return
    }

    // 연결 방식에 맞는 카드를 이어서 보낸다. 연결을 마쳐야 다음 단계로 넘어간다
    setIsAiTyping(true)
    schedule(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'ai', text: followUp.message, connect: { kind: followUp.connect } },
      ])
      setIsAiTyping(false)
    })
  }

  /** AWS 연결 테스트 성공 또는 Terraform 분석 시작 */
  const completeConnect = (messageId: string, answerText: string, result: ConnectResult) => {
    updateAiMessage(messageId, (m) =>
      m.connect ? { ...m, connect: { ...m.connect, done: true, result } } : m,
    )
    answer(answerText, false)
  }

  /** 요약 카드에서 설계 시작을 누른다 */
  const confirmDesign = (messageId: string) => {
    updateAiMessage(messageId, (m) => (m.confirm ? { ...m, confirm: { done: true } } : m))
    schedule(() => setStage('designing'), 600)
  }

  // 선택지·연결 카드를 기다리는 중이면 텍스트 입력을 막는다.
  // 요약 카드가 떠 있을 때는 채팅으로 내용을 고칠 수 있게 열어 둔다
  const canType =
    stage === 'chat' &&
    !isAiTyping &&
    !awaitingCard &&
    (stepIndex < SCRIPT.length || !!pendingConfirm)

  return {
    stage,
    messages,
    info,
    isAiTyping,
    canType,
    start,
    sendMessage,
    confirmChoice,
    completeConnect,
    confirmDesign,
  }
}
