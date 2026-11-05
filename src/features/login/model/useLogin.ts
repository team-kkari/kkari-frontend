import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, useSessionStore } from '@/shared/api'
import { login, type LoginRequest } from '../api/login'

/**
 * 로그인 mutation. 성공하면 세션을 저장한다 (이동은 호출하는 쪽이 정한다).
 * 이 앱은 엔지니어 전용이라 CUSTOMER 계정은 세션을 저장하지 않고 오류로 돌려보낸다.
 */
export function useLogin() {
  const setSession = useSessionStore((state) => state.setSession)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const session = await login(body)
      if (session.role !== 'MSP_ENGINEER') {
        throw new ApiError(403, 'NOT_ENGINEER', '엔지니어 계정으로 로그인해 주세요.')
      }
      return session
    },
    onSuccess: (session) => {
      // 세션이 만료된 뒤 다른 계정으로 들어와도 이전 계정의 데이터가 보이지 않게 한다
      queryClient.clear()
      setSession(session)
    },
  })
}

/** 서버가 준 메시지는 그대로 보여 주고, 그 밖의 오류(네트워크 끊김 등)는 일반 문구를 쓴다 */
export function getLoginErrorMessage(error: Error) {
  return error instanceof ApiError
    ? error.message
    : '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'
}
