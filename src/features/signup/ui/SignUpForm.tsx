import { useId, useState, type FormEvent } from 'react'
import { Button, Checkbox, TextField } from '@/shared/ui'
import { getSignUpErrorMessage, useSignUp } from '../model/useSignUp'
import {
  validateSignUp,
  type SignUpErrors,
  type SignUpField,
  type SignUpValues,
} from '../model/validate'
import styles from './SignUpForm.module.css'

const INITIAL_VALUES: SignUpValues = {
  name: '',
  companyName: '',
  email: '',
  password: '',
  passwordConfirm: '',
  agreed: false,
}

interface SignUpFormProps {
  role: 'customer' | 'engineer'
  /** 가입에 성공하고 세션이 저장된 뒤 호출. 가입한 역할(role)을 함께 넘긴다 */
  onSuccess?: () => void
}

export function SignUpForm({ role, onSuccess }: SignUpFormProps) {
  const { mutate, isPending, error, reset } = useSignUp(role)
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState<SignUpErrors>({})

  const agreementErrorId = useId()

  const update = <K extends SignUpField>(field: K, value: SignUpValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      // 비밀번호를 고치면 '일치하지 않아요' 에러도 더 이상 맞지 않으므로 같이 지운다
      ...(field === 'password' && { passwordConfirm: undefined }),
    }))
    // 입력을 고치기 시작하면 이전 서버 오류 문구는 더 이상 맞지 않는다
    if (error) reset()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPending) return
    const trimmed = {
      ...values,
      name: values.name.trim(),
      companyName: values.companyName.trim(),
      email: values.email.trim(),
    }
    const nextErrors = validateSignUp(trimmed)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    mutate(trimmed, { onSuccess })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="이름"
        variant="filled"
        name="name"
        autoComplete="name"
        placeholder="이름을 입력하세요"
        value={values.name}
        error={errors.name}
        onChange={(event) => update('name', event.target.value)}
      />
      <TextField
        label={role === 'customer' ? '회사명' : '소속 회사'}
        variant="filled"
        name="companyName"
        autoComplete="organization"
        placeholder="회사명을 입력하세요"
        value={values.companyName}
        error={errors.companyName}
        onChange={(event) => update('companyName', event.target.value)}
      />
      <TextField
        label="이메일"
        variant="filled"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="name@company.com"
        value={values.email}
        error={errors.email}
        onChange={(event) => update('email', event.target.value)}
      />
      <TextField
        label="비밀번호"
        variant="filled"
        type="password"
        name="password"
        autoComplete="new-password"
        placeholder="비밀번호를 입력하세요"
        helperText="영문과 숫자를 포함해 8~64자로 입력해 주세요"
        value={values.password}
        error={errors.password}
        onChange={(event) => update('password', event.target.value)}
      />
      <TextField
        label="비밀번호 확인"
        variant="filled"
        type="password"
        name="passwordConfirm"
        autoComplete="new-password"
        placeholder="비밀번호를 한 번 더 입력하세요"
        value={values.passwordConfirm}
        error={errors.passwordConfirm}
        onChange={(event) => update('passwordConfirm', event.target.value)}
      />
      <div className={styles.agreement}>
        <Checkbox
          checked={values.agreed}
          invalid={Boolean(errors.agreed)}
          describedBy={errors.agreed ? agreementErrorId : undefined}
          onChange={(checked) => update('agreed', checked)}
        >
          <span className={styles.strong}>서비스 이용약관</span>
          <span className={styles.muted}> 및 </span>
          <span className={styles.strong}>개인정보 처리방침</span>
          <span className={styles.muted}>에 동의해요</span>
        </Checkbox>
        {errors.agreed && (
          <p id={agreementErrorId} className={styles.fieldError}>
            {errors.agreed}
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className={styles.formError}>
          {getSignUpErrorMessage(error)}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? '가입 중...' : '가입하기'}
      </Button>
    </form>
  )
}
