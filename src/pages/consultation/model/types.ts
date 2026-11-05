export type InfoKey =
  | 'customer'
  | 'request'
  | 'priority'
  | 'budget'
  | 'principles'
  | 'infraConnection'
  | 'infraAnalysis'

export type CollectedInfo = Partial<Record<InfoKey, string>>

export type ConnectKind = 'aws' | 'terraform'

export interface ChoiceOption {
  id: string
  label: string
  description: string
  /** 확인 후 AI가 이어서 보내는 메시지와 연결 카드 */
  followUp?: { message: string; connect: ConnectKind }
}

export interface ChoiceCard {
  question: string
  options: ChoiceOption[]
  /** 처음에 선택돼 있는 항목 */
  defaultId?: string
  /** 확인을 누른 항목. 있으면 카드가 잠긴다 */
  selectedId?: string
}

/** 연결을 마칠 때 입력한 값. 완료된 카드에 그대로 보여준다 */
export interface ConnectResult {
  roleArn?: string
  file?: { name: string; size: number }
}

export interface ConnectCard {
  kind: ConnectKind
  done?: boolean
  result?: ConnectResult
}

export type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | {
      id: string
      role: 'ai'
      text: string
      choice?: ChoiceCard
      connect?: ConnectCard
      /**
       * 수집한 정보를 보여주고 설계 시작을 확인받는 카드.
       * info: 채팅으로 수정해 새 카드로 대체될 때, 이 카드에 보였던 값을 고정해 둔다
       */
      confirm?: { done?: boolean; info?: CollectedInfo }
      /** 입력창 위에 띄우는 빠른 답변 목록 */
      quickReplies?: string[]
    }
