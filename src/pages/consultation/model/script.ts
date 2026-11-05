import type { ChoiceCard, InfoKey } from './types'

/** 오른쪽 패널·요약 카드에 보이는 수집 항목 */
export const INFO_ITEMS: { key: InfoKey; label: string }[] = [
  { key: 'customer', label: '고객사' },
  { key: 'request', label: '의뢰 내용' },
  { key: 'priority', label: '우선순위' },
  { key: 'budget', label: '월 예산' },
  { key: 'infraConnection', label: '인프라 연결' },
  { key: 'infraAnalysis', label: '인프라 분석' },
]

/** 시작 화면 예시. 누르면 바로 쓸 수 있게 상황만 쓴다 */
export const SUGGESTIONS = [
  '비용을 줄이고 싶어요',
  '보안을 강화하고 싶어요',
  '새 서비스를 설계하고 싶어요',
]

/**
 * AI 가 필요한 정보를 다 모았을 때 이어서 안내하는 인프라 연결.
 * 백엔드는 AWS 연결·분석이 끝나야 아키텍처를 만들 수 있어서(Terraform 만으로는 409 AR001) AWS 연결이 필수다.
 */
export const INFRA_INTRO =
  '필요한 정보를 모두 모았어요. 이어서 고객사 AWS 계정을 연결해 인프라를 분석할게요.'

/** AWS 분석이 끝난 뒤 보충 자료로 Terraform state 를 올릴지 묻는다 (선택) */
export const TERRAFORM_INTRO =
  'AWS 분석을 마쳤어요. Terraform state 파일이 있으면 함께 올려 주세요.'

export const TERRAFORM_CHOICE: Omit<ChoiceCard, 'selectedId'> = {
  question: 'Terraform state 파일도 올릴까요? (선택)',
  defaultId: 'skip',
  options: [
    {
      id: 'terraform',
      label: 'Terraform 파일 업로드',
      description: '코드로 관리하는 구성을 함께 참고해요',
      followUp: { message: 'Terraform state 파일을 올려 주세요.', connect: 'terraform' },
    },
    {
      id: 'skip',
      label: '건너뛰기',
      description: 'AWS 분석 결과만으로 설계해요',
    },
  ],
}

export const CLOSING_MESSAGE = '이 내용으로 아키텍처를 설계할까요?'
