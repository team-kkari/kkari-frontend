import { env } from '@/shared/config'
import { toApiError } from './errors'
import { getAccessToken, useSessionStore } from './session'

/**
 * 백엔드 호출. 경로는 `/v1/...` 로 쓰고, 기본 주소는 VITE_API_BASE_URL (배포는 빈 값 = 같은 출처).
 * - 로그인 토큰이 있으면 Authorization 헤더를 붙인다
 * - FormData 는 브라우저가 multipart 경계를 정하도록 Content-Type 을 직접 주지 않는다
 * - 실패하면 ApiError 를 던진다. 토큰을 들고 간 요청이 401 이면 세션을 지운다
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken()
  const isForm = init?.body instanceof FormData

  const headers = new Headers(init?.headers)
  if (!isForm && init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${env.API_BASE_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    if (res.status === 401 && token) useSessionStore.getState().clearSession()
    throw await toApiError(res)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/** JSON 본문을 보내는 호출의 축약 */
export function requestJson<T>(path: string, method: 'POST' | 'PUT' | 'PATCH', body?: unknown) {
  return request<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) })
}
