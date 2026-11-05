import { requestJson, type Session } from '@/shared/api'

/** 백엔드 SignUpRequest. 비밀번호 확인·약관 동의는 프론트에서만 쓰고 보내지 않는다 */
export interface SignUpRequest {
  email: string
  password: string
  name: string
  companyName: string
}

/** POST /v1/auth/signup (엔지니어). 가입 직후 토큰이 발급되며 TokenResponse 는 Session 과 같은 모양이다 */
export function signUp(body: SignUpRequest) {
  return requestJson<Session>('/v1/auth/signup', 'POST', body)
}
