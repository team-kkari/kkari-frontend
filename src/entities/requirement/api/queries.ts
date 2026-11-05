import { queryOptions } from '@tanstack/react-query'
import { ApiError, request } from '@/shared/api'
import type { SavedRequirements } from '../model/types'

export const requirementQueries = {
  all: () => ['requirements'] as const,
  /**
   * 저장된 요구사항. 아직 입력하지 않았으면(404 R001) 오류가 아니라 null 이다.
   * 상담 화면에서 저장했을 수도 있어서 화면에 들어올 때마다 다시 받는다(staleTime 0).
   */
  detail: (projectId: number) =>
    queryOptions({
      queryKey: [...requirementQueries.all(), projectId],
      queryFn: async (): Promise<SavedRequirements | null> => {
        try {
          return await request<SavedRequirements>(`/v1/projects/${projectId}/requirements`)
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) return null
          throw error
        }
      },
      staleTime: 0,
      // 주소의 숫자가 아닌 값(NaN)으로는 호출하지 않는다
      enabled: Number.isInteger(projectId),
      // 4xx 는 다시 해도 같다
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 1,
    }),
}
