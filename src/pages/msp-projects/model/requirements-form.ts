import type { Priority, Requirements } from '@/entities/chat'
import type { BudgetCurrency, SavedRequirements } from '@/entities/requirement'

/** 백엔드 SaveRequirementsRequest 의 길이 제한 */
export const CONTENT_MAX_LENGTH = 5000
export const DESIRED_ARCHITECTURE_MAX_LENGTH = 2000
const FROZEN_RESOURCES_MAX_COUNT = 50
const FROZEN_RESOURCE_MAX_LENGTH = 200

/** 고를 수 있는 우선순위 (표시 순서) */
export const PRIORITY_OPTIONS: Priority[] = ['COST', 'PERFORMANCE', 'RELIABILITY', 'SECURITY']

export const CURRENCY_OPTIONS: BudgetCurrency[] = ['KRW', 'USD']

/** 입력 중인 요구사항. 숫자·목록도 입력 원문 그대로 들고 있다가 저장할 때 바꾼다 */
export interface RequirementsFormState {
  content: string
  /** 앞에 있을수록 중요하다 */
  priorities: Priority[]
  desiredArchitecture: string
  /** 비어 있으면 미확인, 0 이면 예산 상한 없음 */
  budget: string
  currency: BudgetCurrency | null
  /** 아직 고르지 않았으면 null */
  containsPersonalData: boolean | null
  /** 쉼표로 구분한 입력 */
  frozenResources: string
}

export type RequirementsField =
  | 'content'
  | 'priorities'
  | 'desiredArchitecture'
  | 'budget'
  | 'currency'
  | 'containsPersonalData'
  | 'frozenResources'

export type RequirementsErrors = Partial<Record<RequirementsField, string>>

export const EMPTY_FORM: RequirementsFormState = {
  content: '',
  priorities: [],
  desiredArchitecture: '',
  budget: '',
  currency: null,
  containsPersonalData: null,
  frozenResources: '',
}

const isCurrency = (value: string | null | undefined): value is BudgetCurrency =>
  value === 'USD' || value === 'KRW'

/** 서버에 저장된 요구사항으로 폼을 채운다. 없으면(아직 입력 전) 빈 폼 */
export function toFormState(saved: SavedRequirements | null | undefined): RequirementsFormState {
  if (!saved) return EMPTY_FORM
  return {
    content: saved.content ?? '',
    priorities: saved.priorities ?? [],
    desiredArchitecture: saved.desiredArchitecture ?? '',
    budget: saved.monthlyBudget == null ? '' : String(saved.monthlyBudget),
    // USD/KRW 가 아닌 옛 값이면 비워서 다시 고르게 한다
    currency: isCurrency(saved.currency) ? saved.currency : null,
    containsPersonalData: saved.containsPersonalData ?? null,
    frozenResources: (saved.frozenResources ?? []).join(', '),
  }
}

/** 쉼표·줄바꿈으로 나눈 변경 금지 리소스 목록 (빈 항목과 중복은 뺀다) */
export function parseFrozenResources(raw: string): string[] {
  const items = raw
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
  return [...new Set(items)]
}

const BUDGET_PATTERN = /^\d{1,15}(\.\d{1,2})?$/

/** 입력한 월 예산을 숫자로 바꾼다. 비어 있으면 null(미확인), 숫자가 아니면 undefined */
function parseBudget(raw: string): number | null | undefined {
  const text = raw.replace(/[,\s]/g, '')
  if (text === '') return null
  return BUDGET_PATTERN.test(text) ? Number(text) : undefined
}

export type RequirementsValidation =
  { ok: true; request: Requirements } | { ok: false; errors: RequirementsErrors }

/** 백엔드 SaveRequirementsRequest 규칙에 맞는지 먼저 확인하고, 맞으면 저장 요청 본문을 만든다 */
export function validateRequirements(form: RequirementsFormState): RequirementsValidation {
  const errors: RequirementsErrors = {}

  const content = form.content.trim()
  if (!content) errors.content = '요구사항 내용을 입력해 주세요.'
  else if (content.length > CONTENT_MAX_LENGTH) {
    errors.content = `요구사항은 ${CONTENT_MAX_LENGTH}자 이하여야 해요.`
  }

  if (form.priorities.length === 0) errors.priorities = '우선순위를 하나 이상 골라 주세요.'

  const desiredArchitecture = form.desiredArchitecture.trim()
  if (desiredArchitecture.length > DESIRED_ARCHITECTURE_MAX_LENGTH) {
    errors.desiredArchitecture = `원하는 구조는 ${DESIRED_ARCHITECTURE_MAX_LENGTH}자 이하여야 해요.`
  }

  const monthlyBudget = parseBudget(form.budget)
  if (monthlyBudget === undefined) {
    errors.budget = '월 예산은 숫자로 입력해 주세요. 소수는 둘째 자리까지 쓸 수 있어요.'
  } else if (monthlyBudget !== null && monthlyBudget > 0 && !form.currency) {
    errors.currency = '예산 통화(원화·달러)를 골라 주세요.'
  }

  if (form.containsPersonalData === null) {
    errors.containsPersonalData = '개인정보가 포함되는지 골라 주세요.'
  }

  const frozenResources = parseFrozenResources(form.frozenResources)
  if (frozenResources.length > FROZEN_RESOURCES_MAX_COUNT) {
    errors.frozenResources = `변경하면 안 되는 리소스는 ${FROZEN_RESOURCES_MAX_COUNT}개 이하로 적어 주세요.`
  } else if (frozenResources.some((item) => item.length > FROZEN_RESOURCE_MAX_LENGTH)) {
    errors.frozenResources = `항목 하나는 ${FROZEN_RESOURCE_MAX_LENGTH}자 이하여야 해요.`
  }

  // 개인정보 여부·예산 검사는 위 오류와 같은 조건이고, 이후 코드의 타입을 좁히려고 한 번 더 확인한다
  if (
    Object.keys(errors).length > 0 ||
    form.containsPersonalData === null ||
    monthlyBudget === undefined
  ) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    request: {
      content,
      priorities: form.priorities,
      desiredArchitecture: desiredArchitecture || null,
      monthlyBudget,
      // 통화는 양수 예산일 때만 보낸다 (미확인·상한 없음은 통화가 필요 없다)
      currency: monthlyBudget !== null && monthlyBudget > 0 ? form.currency : null,
      containsPersonalData: form.containsPersonalData,
      frozenResources,
    },
  }
}
