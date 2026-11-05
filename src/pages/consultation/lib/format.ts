/** 백엔드가 받는 예산 통화. 대소문자도 그대로 맞아야 한다 */
const BUDGET_CURRENCIES = ['USD', 'KRW']

export const isBudgetCurrency = (currency?: string | null) =>
  !!currency && BUDGET_CURRENCIES.includes(currency)

/** 양수 예산인데 통화가 USD/KRW 가 아니어서, 이대로는 요구사항 저장이 거절되는 상태인지 */
export const lacksBudgetCurrency = (amount?: number | null, currency?: string | null) =>
  typeof amount === 'number' && amount > 0 && !isBudgetCurrency(currency)

/**
 * 상담에서 모은 월 예산을 화면 문구로 만든다. 원본 입력 금액과 통화를 그대로 보여 주고, 환산하지 않는다.
 * - null/undefined: 아직 모름 → undefined (수집 전으로 본다)
 * - 0: 예산 상한 없음
 * - 양수: 금액 + 통화(USD 또는 KRW). 통화가 없거나 지원하지 않는 값이면 확인이 필요하다고 덧붙인다
 */
export function formatBudget(amount?: number | null, currency?: string | null) {
  if (amount === undefined || amount === null) return undefined
  if (amount === 0) return '예산 상한 없음'
  const value = amount.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
  return isBudgetCurrency(currency) ? `${value} ${currency}` : `${value} (통화 확인 필요)`
}

/** 우선순위 표시명. AI 카테고리(소문자 cost 등)와 백엔드 enum(대문자 COST 등)을 모두 받는다 */
const PRIORITY_NAME: Record<string, string> = {
  cost: '비용',
  performance: '성능',
  reliability: '안정성',
  security: '보안',
  operations: '운영',
  sustainability: '지속 가능성',
}

/** 상담 프로필의 우선순위 값을 한글로. 모르는 값은 그대로 보여 준다 */
export const priorityLabel = (priority: string) =>
  PRIORITY_NAME[priority.trim().toLowerCase()] ?? priority

/** 12345 → 12KB 처럼 byte 크기를 읽기 쉽게 */
export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)}KB`
  return `${Math.round(bytes / 1024 ** 2)}MB`
}
