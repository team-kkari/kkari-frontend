/** 고객이 답하는 요구사항 항목. 제출 전 확인 화면의 한 줄씩과 1:1로 맞춘다 */
export type FieldKey =
  | 'concern'
  | 'outcomes'
  | 'priority'
  | 'costGoal'
  | 'serviceName'
  | 'serviceIntro'
  | 'dailyUsers'
  | 'peakTime'
  | 'growth'
  | 'downtimeImpact'
  | 'tolerance'
  | 'personalData'
  | 'compliance'
  | 'changeAllowance'
  | 'serverOps'
  | 'frozenParts'

export type Answers = Partial<Record<FieldKey, string>>

/**
 * 질문에 답하는 방식
 * - text: 입력창에 직접 쓴다
 * - single: 하나를 누르면 바로 답이 된다
 * - multi: 여러 개 고르고 '선택 완료'
 * - ranked: 앞에서 고른 항목을 중요한 순서대로 누른다
 */
export type Prompt =
  | { kind: 'text' }
  | { kind: 'single'; options: string[] }
  | { kind: 'multi'; options: string[] }
  | { kind: 'ranked'; options: string[] }

/** 선택 창으로 답하는 질문 */
export type ChoicePrompt = Exclude<Prompt, { kind: 'text' }>

export interface Engineer {
  id: string
  name: string
  company: string
}

export type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | {
      id: string
      role: 'ai'
      text: string
      /** 입력창 위에 띄우는 선택 창. 답하면 사라진다 */
      prompt?: ChoicePrompt
      /** 담당 엔지니어 선택 창을 띄우는 메시지 */
      pickEngineer?: boolean
    }

export type DeskStage = 'start' | 'chat' | 'review' | 'submitted'
