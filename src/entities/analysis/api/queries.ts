import { queryOptions } from '@tanstack/react-query'
import { getDiscovery } from './requests'

export const analysisQueries = {
  all: () => ['analysis'] as const,
  /** 마지막으로 성공한 분석 결과 (AWS 수집 결과 + 업로드한 Terraform 구조) */
  discovery: (projectId: number) =>
    queryOptions({
      queryKey: [...analysisQueries.all(), projectId, 'discovery'],
      queryFn: () => getDiscovery(projectId),
    }),
}
