import type { UserRole } from '@/shared/api'

/** 로그인한 사용자. 백엔드 CurrentUserResponseDto (GET /v1/users/me) */
export interface CurrentUser {
  id: number
  email: string
  name: string
  companyName: string
  role: UserRole
}
