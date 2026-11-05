import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useSessionStore } from '@/shared/api'

/** 로그아웃 함수를 돌려준다. 세션과 서버 데이터 캐시를 지우고 로그인 화면으로 이동한다 */
export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearSession = useSessionStore((state) => state.clearSession)

  return useCallback(() => {
    clearSession()
    // 다음에 로그인하는 계정이 이전 계정의 의뢰·작업 캐시를 보지 않게 한다
    queryClient.clear()
    navigate('/login', { replace: true })
  }, [clearSession, queryClient, navigate])
}
