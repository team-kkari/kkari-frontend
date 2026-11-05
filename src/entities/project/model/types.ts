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
  /** 오프셋이 있을 수도, 없을 수도 있어 parseServerDate/formatDate 로 다룬다 */
  updatedAt: string
}

/**
 * 프로젝트에 올라가 있는 Terraform 파일 정보. 백엔드 ProjectDetailResponse.terraform 의 메타데이터.
 * 새 백엔드부터 있는 필드라 옛 서버에서는 통째로 없고, 이전에 올린 데이터는 파일명·크기가 비어 있을 수 있다
 */
export interface ProjectTerraform {
  fileName?: string | null
  /** byte */
  size?: number | null
  /** 오프셋이 있을 수도, 없을 수도 있어 parseServerDate/formatDate 로 다룬다 */
  uploadedAt?: string | null
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
  /** Terraform 를 올렸는지. 새 백엔드부터 있고, 없으면(옛 서버) 모르는 것이다 */
  terraformUploaded?: boolean
  /** 올린 Terraform 파일 정보. 올리지 않았으면 null, 옛 서버에서는 없다 */
  terraform?: ProjectTerraform | null
  /** 오프셋이 있을 수도, 없을 수도 있어 parseServerDate/formatDate 로 다룬다 */
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
