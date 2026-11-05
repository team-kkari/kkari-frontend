import type { ChatState } from '@/entities/chat'

/** AI 가 쓰는 상담 항목 식별자(profile 과 같은 camelCase)별 표시명 */
const FIELD_LABEL: Record<string, string> = {
  companyName: '고객사명',
  workload: '워크로드',
  architecture: '현재 구성',
  traffic: '트래픽',
  availability: '가용성 목표',
  performance: '성능 요구',
  cost: '현재 비용',
  monthlyBudget: '월 예산',
  currency: '예산 통화',
  containsPersonalData: '개인정보 포함 여부',
  frozenResources: '변경 금지 리소스',
  goal: '목표',
  priorities: '우선순위',
  changeTolerance: '변경 허용 범위',
  constraints: '제약',
  operations: '운영 체계',
  security: '보안 요구',
  designPrinciples: '설계 원칙·고려사항',
}

/** 옛 백엔드는 snake_case(`monthly_budget`)로 주므로 camelCase 로 맞춘다 */
const toCamelCase = (field: string) =>
  field.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())

/**
 * 상담에서 아직 못 모은 항목의 표시명. 서버가 준 한국어 표시명(missing)을 우선 쓰고,
 * 없으면(예전에 저장된 기록) 식별자(missingFields)를 표시명으로 바꾼다. 모르는 식별자는 뺀다.
 */
export function missingLabelsOf(state?: Pick<ChatState, 'missing' | 'missingFields'> | null) {
  const labels = (state?.missing ?? []).map((label) => label.trim()).filter(Boolean)
  if (labels.length > 0) return [...new Set(labels)]
  const fromFields = (state?.missingFields ?? [])
    .map((field) => FIELD_LABEL[toCamelCase(field)])
    .filter((label): label is string => !!label)
  return [...new Set(fromFields)]
}
