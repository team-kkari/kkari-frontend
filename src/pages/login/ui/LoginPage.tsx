import { Link, useNavigate } from 'react-router'
import { LoginForm } from '@/features/login'
import { homePathOf, useSessionStore } from '@/shared/api'
import { AuthLayout } from '@/widgets/auth-layout'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout
      title="로그인"
      description="고객사 인프라 설계를 이어서 진행하세요"
      footer={
        <>
          <span>계정이 없으신가요?</span>
          <Link to="/signup">회원가입</Link>
        </>
      }
    >
      <LoginForm
        onSuccess={() => {
          // 저장된 세션의 역할에 맞는 첫 화면으로 보낸다
          const role = useSessionStore.getState().session?.role
          navigate(role ? homePathOf(role) : '/', { replace: true })
        }}
      />
    </AuthLayout>
  )
}
