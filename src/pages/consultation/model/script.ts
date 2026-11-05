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

/** AI 가 필요한 정보를 다 모았을 때 이어서 묻는 인프라 연결 방식 */
export const INFRA_INTRO = '필요한 정보를 모두 모았어요. 이어서 인프라 연결을 진행할게요.'

export const INFRA_CHOICE: Omit<ChoiceCard, 'selectedId'> = {
  question: '인프라 정보를 어떻게 연결할까요?',
  defaultId: 'aws',
  options: [
    {
      id: 'aws',
      label: 'AWS 계정 연결',
      description: '실시간 비용·사용률까지 분석',
      followUp: { message: '고객사 AWS 계정을 연결할게요.', connect: 'aws' },
    },
    {
      id: 'terraform',
      label: 'Terraform 파일 업로드',
      description: '계정 연결 없이 구조만 분석',
      followUp: { message: 'Terraform state 파일을 올려 주세요.', connect: 'terraform' },
    },
  ],
}

export const CLOSING_MESSAGE = '이 내용으로 아키텍처를 설계할까요?'
