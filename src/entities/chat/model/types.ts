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
  /** 백엔드가 유효한 값(공백 제외 100자 이하)이면 프로젝트 고객사명에도 반영한다 */
  companyName?: string | null
  workload?: string | null
  architecture?: string | null
  traffic?: string | null
  availability?: string | null
  performance?: string | null
  cost?: string | null
  /** 원본 입력 금액. null 은 아직 모름, 0 은 예산 상한 없음이다 (KRW 는 원 단위) */
  monthlyBudget?: number | null
  /** 예산 입력 통화. USD 또는 KRW 이고, 양수 예산인데 비어 있으면 아직 확인 전이다 */
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
  /** 원본 입력 금액. null 은 미확인, 0 은 예산 상한 없음이다. 같은 값을 다른 통화로 바꿔 저장하지 않는다 */
  monthlyBudget?: number | null
  /** USD 또는 KRW. 양수 예산이면 필수다 (없거나 다른 값이면 저장이 400 으로 거절된다) */
  currency?: string | null
  containsPersonalData?: boolean | null
  frozenResources?: string[] | null
}

/** 대화 기록 + 마지막 상담 결과. 백엔드 ChatHistoryResponseDto */
export interface ChatState {
  messages: ChatMessageDto[]
  /** 아직 못 모은 필수 항목의 한국어 표시명 (예: '월 예산'). 예전에 저장된 기록에는 없을 수 있다 */
  missing?: string[] | null
  /**
   * 아직 못 모은 필수 항목의 식별자. 새 백엔드는 profile 과 같은 camelCase(`monthlyBudget`)이고,
   * 옛 백엔드는 AI 원본인 snake_case(`monthly_budget`)다
   */
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
