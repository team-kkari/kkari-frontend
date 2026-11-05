import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, useSessionStore } from '@/shared/api'
import { signUp } from '../api/signup'
import type { SignUpValues } from './validate'

/** 회원가입 mutation. 성공하면 세션을 저장한다 (이동은 호출하는 쪽이 정한다) */
export function useSignUp() {
  const setSession = useSessionStore((state) => state.setSession)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password, name, companyName }: SignUpValues) =>
      signUp({ email, password, name, companyName }),
    onSuccess: (session) => {
      // 세션이 만료된 뒤 다른 계정으로 들어와도 이전 계정의 데이터가 보이지 않게 한다
      queryClient.clear()
      setSession(session)
    },
  })
}

/** 서버가 준 메시지(409 이미 가입된 이메일 등)는 그대로 보여 주고, 그 밖의 오류는 일반 문구를 쓴다 */
export function getSignUpErrorMessage(error: Error) {
  return error instanceof ApiError
    ? error.message
    : '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'
}
