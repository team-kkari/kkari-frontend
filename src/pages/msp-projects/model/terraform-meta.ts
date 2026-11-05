import type { ProjectDetail } from '@/entities/project'

export interface TerraformMeta {
  /** 업로드한 Terraform state 가 서버에 저장돼 있는지 */
  uploaded: boolean
  /** 이전 업로드 데이터나 옛 서버는 파일 정보가 없을 수 있다 */
  fileName?: string
  size?: number
  uploadedAt?: string
}

/** 프로젝트 상세에서 Terraform 업로드 상태를 읽는다. 옛 서버는 관련 필드를 주지 않는다 */
export function readTerraformMeta(project: ProjectDetail): TerraformMeta {
  const { terraformUploaded, terraform } = project
  return {
    uploaded: terraformUploaded === true || !!terraform,
    fileName: terraform?.fileName ?? undefined,
    size: terraform?.size ?? undefined,
    uploadedAt: terraform?.uploadedAt ?? undefined,
  }
}
