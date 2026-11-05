import { isEmail } from '@/shared/lib'

export interface SignUpValues {
  name: string
  companyName: string
  email: string
  password: string
  passwordConfirm: string
  agreed: boolean
}

export type SignUpField = keyof SignUpValues
export type SignUpErrors = Partial<Record<SignUpField, string>>

// 길이 제한은 백엔드 SignUpRequest 검증과 맞춘다
export function validateSignUp(values: SignUpValues): SignUpErrors {
  const errors: SignUpErrors = {}

  if (!values.name) errors.name = '이름을 입력해 주세요.'
  else if (values.name.length > 50) errors.name = '이름은 50자 이하로 입력해 주세요.'

  if (!values.companyName) errors.companyName = '소속 회사를 입력해 주세요.'
  else if (values.companyName.length > 100)
    errors.companyName = '소속 회사는 100자 이하로 입력해 주세요.'

  if (!values.email) errors.email = '이메일을 입력해 주세요.'
  else if (!isEmail(values.email)) errors.email = '이메일 형식이 올바르지 않아요.'

  if (!values.password) errors.password = '비밀번호를 입력해 주세요.'
  else if (
    values.password.length < 8 ||
    values.password.length > 64 ||
    !/[A-Za-z]/.test(values.password) ||
    !/\d/.test(values.password)
  )
    errors.password = '8~64자, 영문과 숫자를 포함해 주세요.'

  if (!values.passwordConfirm) errors.passwordConfirm = '비밀번호를 한 번 더 입력해 주세요.'
  else if (values.passwordConfirm !== values.password)
    errors.passwordConfirm = '비밀번호가 일치하지 않아요.'

  if (!values.agreed) errors.agreed = '이용약관 및 개인정보 처리방침에 동의해 주세요.'

  return errors
}
