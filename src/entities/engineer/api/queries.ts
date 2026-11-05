import { queryOptions } from '@tanstack/react-query'
import { request } from '@/shared/api'
import type { Engineer } from '../model/types'

export const engineerQueries = {
  all: () => ['engineers'] as const,
  /** 서비스 등록 때 담당 엔지니어를 고르는 목록(이름 순). 고객 전용 API */
  list: () =>
    queryOptions({
      queryKey: [...engineerQueries.all(), 'list'],
      queryFn: () => request<Engineer[]>('/v1/customer/engineers'),
    }),
}
