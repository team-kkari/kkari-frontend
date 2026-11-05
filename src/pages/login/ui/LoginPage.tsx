import { Link, useNavigate } from 'react-router'
import { LoginForm } from '@/features/login'
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
      <LoginForm onSuccess={() => navigate('/', { replace: true })} />
    </AuthLayout>
  )
}
