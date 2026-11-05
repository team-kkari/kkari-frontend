import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { RoleSelection, SignUpForm, type SignUpRole } from '@/features/signup'
import { Button } from '@/shared/ui'
import { AuthLayout } from '@/widgets/auth-layout'
import styles from './SignUpPage.module.css'

const BRAND = {
  select: {
    title: (
      <>
        인프라 고민부터 설계까지,
        <br />
        한곳에서 이어져요
      </>
    ),
    description: '고객은 요구사항을 맡기고, 엔지니어는 AI로 설계해요',
    features: [
      '고객은 쉬운 질문에 답해 요구사항을 등록해요',
      '담당 엔지니어가 AWS를 연결해 분석해요',
      'AI가 비용·성능·안정성 기준으로 구조를 추천해요',
    ],
  },
  customer: {
    title: (
      <>
        우리 서비스 인프라,
        <br />
        전문가에게 맡겨요
      </>
    ),
    description: '질문에 답하면 담당 엔지니어에게 전달돼요',
    features: [
      '어려운 용어 없이 질문에 답해요',
      '담당 엔지니어를 직접 골라요',
      '진행 단계를 바로 확인해요',
    ],
  },
  engineer: {
    title: (
      <>
        고객사 인프라,
        <br />
        AI가 설계해 드려요
      </>
    ),
    description: 'MSP·클라우드 엔지니어를 위한 아키텍처 설계 도구',
    features: [
      '대화하듯 요구사항과 인프라 정보를 모아요',
      'AWS Best Practice로 아키텍처 후보를 추천해요',
      '비용·성능·안정성 점수로 한눈에 비교해요',
    ],
  },
}

export function SignUpPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'select' | SignUpRole>('select')
  const [selectedRole, setSelectedRole] = useState<SignUpRole>()
  const isSelecting = step === 'select'

  return (
    <AuthLayout
      title={
        isSelecting
          ? '어떻게 사용하시나요?'
          : step === 'customer'
            ? '고객 회원가입'
            : '엔지니어 회원가입'
      }
      description={
        isSelecting
          ? '가입 유형을 골라 주세요. 유형에 따라 보이는 화면이 달라져요'
          : step === 'customer'
            ? '가입하고 검토받을 서비스를 등록해 보세요'
            : '계정을 만들고 고객 의뢰를 받아 보세요'
      }
      brand={BRAND[step]}
      beforeHeader={
        !isSelecting && (
          <button type="button" className={styles.back} onClick={() => setStep('select')}>
            가입 유형 다시 선택
          </button>
        )
      }
      footer={
        <>
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login">로그인</Link>
        </>
      }
    >
      {isSelecting ? (
        <div className={styles.selection}>
          <RoleSelection value={selectedRole} onChange={setSelectedRole} />
          <Button disabled={!selectedRole} onClick={() => selectedRole && setStep(selectedRole)}>
            계속
          </Button>
        </div>
      ) : (
        <SignUpForm
          role={step}
          // 가입한 역할의 첫 화면으로 이동 (고객은 고객 창구, 엔지니어는 의뢰 상담)
          onSuccess={() => navigate(step === 'customer' ? '/desk' : '/', { replace: true })}
        />
      )}
    </AuthLayout>
  )
}
