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
      {/* API 연결 전이라 검증만 통과하면 바로 메인으로 이동 */}
      <LoginForm onSubmit={() => navigate('/', { replace: true })} />
    </AuthLayout>
  )
}
