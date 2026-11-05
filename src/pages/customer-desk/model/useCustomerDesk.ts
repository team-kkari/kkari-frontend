import { useCallback, useEffect, useRef, useState } from 'react'
import type { Engineer } from '@/entities/engineer'
import { ENGINEER_MESSAGE, SCRIPT } from './script'
import type { Answers, ChatMessage, DeskStage, FieldKey } from './types'

/** AI가 답을 준비하는 척하는 시간. 질문은 대본이 정하므로 서버를 기다리지 않고 대화 리듬만 낸다 */
const AI_DELAY_MS = 700

let messageSeq = 0
const nextId = () => `m-${++messageSeq}`

function aiMessageFor(stepIndex: number, answers: Answers): ChatMessage {
  const step = SCRIPT[stepIndex]
  if (!step) return { id: nextId(), role: 'ai', text: ENGINEER_MESSAGE, pickEngineer: true }
  const prompt = typeof step.prompt === 'function' ? step.prompt(answers) : step.prompt
  return {
    id: nextId(),
    role: 'ai',
    text: step.message,
    prompt: prompt.kind === 'text' ? undefined : prompt,
  }
}

/**
 * 고객 창구 대화 상태. 대화 → 담당 엔지니어 선택 → 제출 전 확인.
 * 제출은 페이지가 서버에 보내고, 성공하면 reset으로 처음 상태로 돌린다
 */
export function useCustomerDesk() {
  const [stage, setStage] = useState<DeskStage>('start')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [answers, setAnswers] = useState<Answers>({})
  /** 지금 답을 기다리는 질문. SCRIPT.length면 담당 엔지니어 선택 단계 */
  const [stepIndex, setStepIndex] = useState(0)
  const [engineer, setEngineer] = useState<Engineer>()
  const [isAiTyping, setIsAiTyping] = useState(false)

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const later = (fn: () => void, ms = AI_DELAY_MS) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(fn, ms)
  }

  const askStep = (index: number, nextAnswers: Answers) => {
    setIsAiTyping(true)
    later(() => {
      setMessages((prev) => [...prev, aiMessageFor(index, nextAnswers)])
      setStepIndex(index)
      setIsAiTyping(false)
    })
  }

  const recordAnswer = (stepIndex: number, text: string) => {
    const { field, extract } = SCRIPT[stepIndex]
    const nextAnswers = { ...answers, [field]: extract ? extract(text) : text }
    setAnswers(nextAnswers)
    return nextAnswers
  }

  const start = (text: string) => {
    const first = aiMessageFor(0, {})
    setMessages([first, { id: nextId(), role: 'user', text }])
    setStage('chat')
    askStep(1, recordAnswer(0, text))
  }

  const answer = (text: string) => {
    if (!SCRIPT[stepIndex] || isAiTyping) return
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
    askStep(stepIndex + 1, recordAnswer(stepIndex, text))
  }

  const chooseEngineer = (picked: Engineer) => {
    setEngineer(picked)
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text: `${picked.name} · ${picked.companyName}` },
    ])
    later(() => setStage('review'), 400)
  }

  const editAnswer = (field: FieldKey, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  /** 제출 전 확인 화면에서 '이전': 대화로 돌아가 담당 엔지니어를 다시 고를 수 있다 */
  const backToChat = () => {
    setMessages((prev) => [...prev, aiMessageFor(SCRIPT.length, answers)])
    setStage('chat')
  }

  const reset = useCallback(() => {
    clearTimeout(timer.current)
    setStage('start')
    setMessages([])
    setAnswers({})
    setStepIndex(0)
    setEngineer(undefined)
    setIsAiTyping(false)
  }, [])

  return {
    stage,
    messages,
    answers,
    engineer,
    isAiTyping,
    /** 입력창으로 답할 수 있는지 (담당 엔지니어 선택 단계에선 선택 창으로만) */
    canType: stage === 'chat' && !isAiTyping && stepIndex < SCRIPT.length,
    start,
    answer,
    chooseEngineer,
    setEngineer,
    editAnswer,
    backToChat,
    reset,
  }
}
