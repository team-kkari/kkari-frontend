/** 서비스(의뢰)가 어디까지 진행됐는지. 백엔드 ServiceListResponse.stage */
export type CustomerServiceStage = 'RECEIVED' | 'ANALYZED' | 'RECOMMENDED'

/** 내 서비스 목록의 한 건. 백엔드 ServiceListResponse */
export interface CustomerServiceSummary {
  serviceId: number
  serviceName: string
  engineerName: string
  stage: CustomerServiceStage
  /** 오프셋이 없는 옛 형식일 수 있어 parseServerDate/formatDate 로 다룬다 */
  createdAt: string
}

/** 내 서비스 상세. 백엔드 ServiceDetailResponse. answers 는 질문 라벨 → 답 */
export interface CustomerServiceDetail extends CustomerServiceSummary {
  answers?: Record<string, string> | null
}

/**
 * 서비스 등록 요청. 백엔드 RegisterServiceRequest
 * (serviceName ≤ 100자, answers 50개 이하 · 키 ≤ 200자 · 값 ≤ 2000자)
 */
export interface RegisterServiceBody {
  serviceName: string
  answers: Record<string, string>
  engineerId: number
}

export const CUSTOMER_SERVICE_STAGE_LABEL: Record<CustomerServiceStage, string> = {
  RECEIVED: '접수됨',
  ANALYZED: '분석 완료',
  RECOMMENDED: '추천 완료',
}

/** 서버가 받는 길이 제한. 입력창과 요청 만들기에서 같이 쓴다 (질문 라벨은 고정이라 200자를 넘지 않는다) */
export const SERVICE_NAME_MAX_LENGTH = 100
export const ANSWER_VALUE_MAX_LENGTH = 2000
