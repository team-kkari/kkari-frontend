import { requestJson, type Session } from '@/shared/api'

/** 백엔드 LoginRequest */
export interface LoginRequest {
  email: string
  password: string
}

/** POST /v1/auth/login. 응답 TokenResponse 는 Session 과 같은 모양이다 */
export function login(body: LoginRequest) {
  return requestJson<Session>('/v1/auth/login', 'POST', body)
}
