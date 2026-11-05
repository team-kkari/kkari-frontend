import { useId, useState, type FormEvent } from 'react'
import { Button, Checkbox, TextField } from '@/shared/ui'
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
  /** 검증을 통과했을 때 호출. API 연결은 후속 작업 */
  onSubmit?: (values: SignUpValues) => void
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
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
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = {
      ...values,
      name: values.name.trim(),
      companyName: values.companyName.trim(),
      email: values.email.trim(),
    }
    const nextErrors = validateSignUp(trimmed)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit?.(trimmed)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="이름"
        name="name"
        autoComplete="name"
        placeholder="이름을 입력하세요"
        value={values.name}
        error={errors.name}
        onChange={(event) => update('name', event.target.value)}
      />
      <TextField
        label="소속 회사"
        name="companyName"
        autoComplete="organization"
        placeholder="회사명을 입력하세요"
        value={values.companyName}
        error={errors.companyName}
        onChange={(event) => update('companyName', event.target.value)}
      />
      <TextField
        label="이메일"
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
        type="password"
        name="password"
        autoComplete="new-password"
        placeholder="비밀번호를 입력하세요"
        helperText="8자 이상, 영문과 숫자를 포함해 주세요"
        value={values.password}
        error={errors.password}
        onChange={(event) => update('password', event.target.value)}
      />
      <TextField
        label="비밀번호 확인"
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
      <Button type="submit">회원가입</Button>
    </form>
  )
}
