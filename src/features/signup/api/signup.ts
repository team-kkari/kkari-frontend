import { requestJson, type Session } from '@/shared/api'
import type { SignUpRole } from '../ui/RoleSelection'

/** 백엔드 SignUpRequest. 비밀번호 확인·약관 동의는 프론트에서만 쓰고 보내지 않는다 */
export interface SignUpRequest {
  email: string
  password: string
  name: string
  companyName: string
}

/**
 * 가입. 엔지니어는 POST /v1/auth/signup, 고객은 POST /v1/auth/signup/customer.
 * 가입 직후 토큰이 발급되며 TokenResponse 는 Session 과 같은 모양이다.
 */
export function signUp(role: SignUpRole, body: SignUpRequest) {
  const path = role === 'customer' ? '/v1/auth/signup/customer' : '/v1/auth/signup'
  return requestJson<Session>(path, 'POST', body)
}
