import type { ProjectTerraform } from '@/entities/project'
import { formatDate } from '@/shared/lib'
import { formatFileSize } from '../lib/format'
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

/** 이미 Terraform state 파일이 올라가 있는 프로젝트에서 AWS 분석을 마쳤을 때 */
export const TERRAFORM_UPLOADED_INTRO =
  'AWS 분석을 마쳤어요. 이미 올려 둔 Terraform state 파일이 있어요.'

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

/** 올려 둔 파일의 이름·크기·올린 날을 한 줄로. 서버가 모르는 값(이전 업로드)은 뺀다 */
function describeTerraform(terraform?: ProjectTerraform | null) {
  const uploadedDate = formatDate(terraform?.uploadedAt)
  const parts = [
    terraform?.fileName,
    typeof terraform?.size === 'number' ? formatFileSize(terraform.size) : undefined,
    uploadedDate !== '-' ? `${uploadedDate} 올림` : undefined,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : '이전에 올린 파일이에요'
}

/** 이미 올려 둔 Terraform 파일이 있을 때 보여 주는 선택 카드. 기본은 올려 둔 파일을 그대로 쓰는 것이다 */
export function terraformUploadedChoice(
  terraform?: ProjectTerraform | null,
): Omit<ChoiceCard, 'selectedId'> {
  return {
    question: '올려 둔 Terraform 파일을 어떻게 할까요?',
    defaultId: 'keep',
    options: [
      {
        id: 'keep',
        label: '올려 둔 파일 그대로 사용',
        description: describeTerraform(terraform),
      },
      {
        id: 'terraform',
        label: '다른 파일로 교체',
        description: '새 파일을 올리면 이전 파일은 대체돼요',
        followUp: { message: 'Terraform state 파일을 올려 주세요.', connect: 'terraform' },
      },
    ],
  }
}

/** 마지막 설계 작업이 실패한 채로 상담에 다시 들어왔을 때 확인 카드 앞에 붙이는 안내 */
export const designFailedMessage = (reason?: string | null) =>
  `이전 설계 요청이 실패했어요${reason ? ` (${reason})` : ''}. 아래에서 다시 설계를 시작할 수 있어요.`

export const CLOSING_MESSAGE = '이 내용으로 아키텍처를 설계할까요?'
