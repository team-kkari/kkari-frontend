import { Navigate, Outlet } from 'react-router'
import { useSessionStore } from '@/shared/api'

/** 로그인 세션이 있어야 하위 라우트를 보여 주는 레이아웃 라우트. 없으면 로그인 화면으로 보낸다 */
export function RequireAuth() {
  const session = useSessionStore((state) => state.session)

  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}
