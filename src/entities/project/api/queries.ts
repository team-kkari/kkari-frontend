import { queryOptions } from '@tanstack/react-query'
import { request } from '@/shared/api'
import type { ProjectDetail, ProjectStage, ProjectSummary } from '../model/types'

export const projectQueries = {
  all: () => ['projects'] as const,
  /** 내 프로젝트 목록(최근 수정 순). stage 를 주면 그 단계만 */
  list: (stage?: ProjectStage) =>
    queryOptions({
      queryKey: [...projectQueries.all(), 'list', stage ?? 'all'],
      queryFn: () => {
        const query = stage ? `?stage=${stage}` : ''
        return request<ProjectSummary[]>(`/v1/projects${query}`)
      },
    }),
  detail: (projectId: number) =>
    queryOptions({
      queryKey: [...projectQueries.all(), 'detail', projectId],
      queryFn: () => request<ProjectDetail>(`/v1/projects/${projectId}`),
      // 주소의 숫자가 아닌 값(NaN)으로는 호출하지 않는다
      enabled: Number.isInteger(projectId),
    }),
}
