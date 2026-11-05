import { Navigate, Outlet } from 'react-router'
import { homePathOf, useSessionStore, type UserRole } from '@/shared/api'

interface RequireAuthProps {
  /** 이 역할만 들어갈 수 있다. 생략하면 로그인한 모두 */
  role?: UserRole
}

/**
 * 로그인 세션이 있어야 하위 라우트를 보여 주는 레이아웃 라우트.
 * 세션이 없으면 로그인 화면으로, 역할이 맞지 않으면 그 역할의 첫 화면으로 보낸다.
 */
export function RequireAuth({ role }: RequireAuthProps) {
  const session = useSessionStore((state) => state.session)

  if (!session) return <Navigate to="/login" replace />
  if (role && session.role !== role) return <Navigate to={homePathOf(session.role)} replace />
  return <Outlet />
}
