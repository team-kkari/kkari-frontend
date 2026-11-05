import { useState, type FormEvent } from 'react'
import { isEmail } from '@/shared/lib'
import { Button, Checkbox, TextField } from '@/shared/ui'
import styles from './LoginForm.module.css'

type Field = 'email' | 'password'
type FieldErrors = Partial<Record<Field, string>>

export interface LoginValues {
  email: string
  password: string
  remember: boolean
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!email) errors.email = '이메일을 입력해 주세요.'
  else if (!isEmail(email)) errors.email = '이메일 형식이 올바르지 않아요.'
  if (!password) errors.password = '비밀번호를 입력해 주세요.'
  return errors
}

interface LoginFormProps {
  /** 검증을 통과했을 때 호출. API 연결은 후속 작업 */
  onSubmit?: (values: LoginValues) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const clearError = (field: Field) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedEmail = email.trim()
    const errors = validate(trimmedEmail, password)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    onSubmit?.({ email: trimmedEmail, password, remember })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="이메일"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="name@company.com"
        value={email}
        error={fieldErrors.email}
        onChange={(event) => {
          setEmail(event.target.value)
          clearError('email')
        }}
      />
      <TextField
        label="비밀번호"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="비밀번호를 입력하세요"
        value={password}
        error={fieldErrors.password}
        onChange={(event) => {
          setPassword(event.target.value)
          clearError('password')
        }}
      />
      <div className={styles.options}>
        <Checkbox checked={remember} onChange={setRemember}>
          로그인 상태 유지
        </Checkbox>
        {/* 비밀번호 찾기는 아직 기능이 없어 텍스트만 둔다 */}
        <span className={styles.findPassword}>비밀번호 찾기</span>
      </div>
      <Button type="submit">로그인</Button>
    </form>
  )
}
