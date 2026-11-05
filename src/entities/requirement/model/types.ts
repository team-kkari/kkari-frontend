/** 우선순위. 백엔드 Priority enum — 배열에서 앞에 있을수록 중요하다 */
export type RequirementPriority = 'COST' | 'PERFORMANCE' | 'RELIABILITY' | 'SECURITY'

/** 예산 입력 통화. 백엔드가 받는 값은 USD, KRW 뿐이다 */
export type BudgetCurrency = 'USD' | 'KRW'

/**
 * 저장된 요구사항. 백엔드 Requirements (GET /v1/projects/{id}/requirements).
 * monthlyBudget 는 null 이면 미확인, 0 이면 예산 상한 없음이고, 양수면 currency 가 함께 있다.
 */
export interface SavedRequirements {
  content: string
  priorities: RequirementPriority[]
  desiredArchitecture?: string | null
  monthlyBudget?: number | null
  /** 옛 데이터는 USD/KRW 가 아닌 값이거나 비어 있을 수 있어 문자열로 받는다 */
  currency?: string | null
  containsPersonalData: boolean
  frozenResources?: string[] | null
}
