/** 요구사항 우선순위. 백엔드 enum — 배열에서 앞에 있을수록 중요하다 */
export type Priority = 'COST' | 'PERFORMANCE' | 'RELIABILITY' | 'SECURITY'

export const PRIORITY_LABEL: Record<Priority, string> = {
  COST: '비용',
  PERFORMANCE: '성능',
  RELIABILITY: '안정성',
  SECURITY: '보안',
}

/** 대화 한 줄. 백엔드 ChatMessageResponseDto */
export interface ChatMessageDto {
  id: number
  role: 'USER' | 'ASSISTANT'
  content: string
  quickReplies?: string[] | null
  createdAt: string
}

/** AI 가 인터뷰로 모은 정보. 아직 모르는 값은 null. 백엔드 IntakeProfileResponseDto */
export interface IntakeProfile {
  companyName?: string | null
  workload?: string | null
  architecture?: string | null
  traffic?: string | null
  availability?: string | null
  performance?: string | null
  cost?: string | null
  monthlyBudget?: number | null
  currency?: string | null
  containsPersonalData?: boolean | null
  frozenResources?: string[] | null
  goal?: string | null
  priorities?: string[] | null
  changeTolerance?: string | null
  constraints?: string | null
  operations?: string | null
  security?: string | null
}

/** 요구사항. 백엔드 SaveRequirementsRequest / RequirementsDraftResponseDto 가 같은 모양이다 */
export interface Requirements {
  content?: string | null
  priorities?: Priority[] | null
  desiredArchitecture?: string | null
  monthlyBudget?: number | null
  currency?: string | null
  containsPersonalData?: boolean | null
  frozenResources?: string[] | null
}

/** 대화 기록 + 마지막 상담 결과. 백엔드 ChatHistoryResponseDto */
export interface ChatState {
  messages: ChatMessageDto[]
  /** 아직 못 모은 필수 항목 */
  missing?: string[] | null
  missingFields?: string[] | null
  /** true 면 설계를 시작할 만큼 모았다 */
  ready: boolean
  profile?: IntakeProfile | null
  requirementsDraft?: Requirements | null
}

/** 메시지 전송 응답. 백엔드 SendChatMessageResponseDto */
export interface SendChatResponse extends Omit<ChatState, 'messages'> {
  /** 내용 없이 상담을 시작하거나 실패한 응답을 다시 요청하면 null 일 수 있다 */
  userMessage?: ChatMessageDto | null
  assistantMessage?: ChatMessageDto | null
}
