import { Link, useNavigate } from 'react-router'
import { SignUpForm } from '@/features/signup'
import { AuthLayout } from '@/widgets/auth-layout'

export function SignUpPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout
      title="회원가입"
      description="계정을 만들고 첫 의뢰를 시작해 보세요"
      footer={
        <>
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login">로그인</Link>
        </>
      }
    >
      <SignUpForm onSuccess={() => navigate('/', { replace: true })} />
    </AuthLayout>
  )
}
