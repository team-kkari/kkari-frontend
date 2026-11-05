/** 의뢰가 어디까지 진행됐는지. 백엔드 ProjectListResponse.stage */
export type ProjectStage = 'RECEIVED' | 'ANALYZED' | 'RECOMMENDED'

/** 고객 AWS 계정 연결 상태. 백엔드 ProjectDetailResponse.awsConnectionStatus */
export type AwsConnectionStatus =
  'NOT_CONNECTED' | 'UNTESTED' | 'CONNECTED' | 'TRUST_POLICY_ERROR' | 'PERMISSION_DENIED'

/** 사이드바 목록에 보이는 프로젝트(의뢰) 한 건. 백엔드 ProjectListResponse */
export interface ProjectSummary {
  projectId: number
  companyName: string
  contactName: string
  stage: ProjectStage
  /** 분석 전에는 값이 없을 수 있다 */
  monthlyCost?: number | null
  updatedAt: string
}

/** 프로젝트 상세. 직접 만든 프로젝트는 serviceName·answers 가 비어 있다. 백엔드 ProjectDetailResponse */
export interface ProjectDetail {
  projectId: number
  serviceName?: string | null
  companyName: string
  contactName: string
  answers?: Record<string, string> | null
  stage: ProjectStage
  awsConnectionStatus: AwsConnectionStatus
  createdAt: string
  updatedAt: string
}

/** 프로젝트 생성 요청. 백엔드 CreateProjectRequest (companyName ≤ 100자, contactName ≤ 50자) */
export interface CreateProjectBody {
  companyName: string
  contactName: string
}

export const PROJECT_STAGE_LABEL: Record<ProjectStage, string> = {
  RECEIVED: '접수',
  ANALYZED: '분석 완료',
  RECOMMENDED: '추천 완료',
}
