import { request } from '@/shared/api'
import type { DiscoveryResponse, StartAnalysisResponse, TerraformInfra } from '../model/types'

const base = (projectId: number) => `/v1/projects/${projectId}`

/** 인프라 분석을 시작한다. 이미 대기·실행 중인 작업이 있으면 그 작업 ID 를 돌려준다 */
export const startAnalysis = (projectId: number) =>
  request<StartAnalysisResponse>(`${base(projectId)}/analysis`, { method: 'POST' })

/** 마지막으로 성공한 분석 결과. 아직 없으면 404(AN003) */
export const getDiscovery = (projectId: number) =>
  request<DiscoveryResponse>(`${base(projectId)}/discovery`)

/** Terraform state 파일을 올린다 (multipart/form-data, 필드 이름 file). 다시 올리면 교체된다 */
export function uploadTerraform(projectId: number, file: File) {
  const form = new FormData()
  form.append('file', file)
  return request<TerraformInfra>(`${base(projectId)}/terraform`, { method: 'POST', body: form })
}
