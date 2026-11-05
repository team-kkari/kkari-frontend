import { queryOptions } from '@tanstack/react-query'
import { request } from '@/shared/api'
import type { CustomerServiceDetail, CustomerServiceSummary } from '../model/types'

export const customerServiceQueries = {
  all: () => ['customer-services'] as const,
  /** 내 서비스 목록(최근 등록 순). 엔지니어가 단계를 올리므로 다시 열 때마다 새로 받는다 */
  list: () =>
    queryOptions({
      queryKey: [...customerServiceQueries.all(), 'list'],
      queryFn: () => request<CustomerServiceSummary[]>('/v1/customer/services'),
      staleTime: 0,
    }),
  detail: (serviceId: number) =>
    queryOptions({
      queryKey: [...customerServiceQueries.all(), 'detail', serviceId],
      queryFn: () => request<CustomerServiceDetail>(`/v1/customer/services/${serviceId}`),
      staleTime: 0,
      enabled: Number.isInteger(serviceId),
    }),
}
