import { queryOptions } from '@tanstack/react-query'
import { delay } from '@/shared/lib'
import type { ArchitectureRequest } from '../model/types'
import { mockRequests } from './mock'

// TODO: 백엔드 연결 시 request<ArchitectureRequest[]>('/requests') 로 교체
async function fetchRequests(): Promise<ArchitectureRequest[]> {
  await delay(150)
  return mockRequests
}

export const requestQueries = {
  all: () => ['requests'] as const,
  list: () =>
    queryOptions({
      queryKey: [...requestQueries.all(), 'list'],
      queryFn: fetchRequests,
    }),
}
