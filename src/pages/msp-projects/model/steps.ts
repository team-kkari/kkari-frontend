/** 프로젝트 목록 화면 경로 */
export const MSP_PROJECTS_PATH = '/msp/projects'

/** 의뢰를 처리하는 순서. 주소의 :step 값이 key 다 */
export const MSP_STEPS = [
  { key: 'answers', label: '고객 답변 확인' },
  { key: 'requirements', label: '요구사항 입력' },
  { key: 'aws', label: 'AWS 연결' },
  { key: 'analysis', label: '인프라 분석' },
  { key: 'recommendation', label: '추천 생성' },
] as const

export type StepKey = (typeof MSP_STEPS)[number]['key']

export const isStepKey = (value: string): value is StepKey =>
  MSP_STEPS.some((step) => step.key === value)

export const stepPath = (projectId: number, step: StepKey) =>
  `${MSP_PROJECTS_PATH}/${projectId}/${step}`

export const stepIndex = (step: StepKey) => MSP_STEPS.findIndex((item) => item.key === step)

/** 이전 단계. 첫 단계면 undefined */
export const previousStep = (step: StepKey): StepKey | undefined =>
  MSP_STEPS[stepIndex(step) - 1]?.key

/** 주소의 projectId 를 숫자로 바꾼다. 양의 정수가 아니면 undefined */
export function parseProjectId(value: string | undefined): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : undefined
}
