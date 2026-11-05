import { queryOptions } from '@tanstack/react-query'
import { request } from '@/shared/api'
import type { CurrentUser } from '../model/types'

export const userQueries = {
  all: () => ['user'] as const,
  /**
   * 내 정보. 백엔드 새 버전부터 있는 API 라서, 아직 없는 서버(404)에서는 실패해도 화면이 깨지지 않게
   * 호출하는 쪽에서 이름이 없을 때의 대체 문구를 쓴다. 4xx 는 다시 해도 같아서 재시도하지 않는다.
   */
  me: () =>
    queryOptions({
      queryKey: [...userQueries.all(), 'me'],
      queryFn: () => request<CurrentUser>('/v1/users/me'),
      staleTime: 5 * 60_000,
      retry: false,
    }),
}
