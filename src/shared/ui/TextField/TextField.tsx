import { useId, useState, type InputHTMLAttributes } from 'react'
import eyeIcon from '../icons/eye.svg'
import eyeOffIcon from '../icons/eye-off.svg'
import styles from './TextField.module.css'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  helperText?: string
  error?: string
}

export function TextField({ label, helperText, error, type = 'text', ...props }: TextFieldProps) {
  const id = useId()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isPassword = type === 'password'
  const message = error ?? helperText

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={[styles.box, error && styles.invalid].filter(Boolean).join(' ')}>
        <input
          id={id}
          type={isPassword && isPasswordVisible ? 'text' : type}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? `${id}-message` : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggle}
            aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
          >
            <img src={isPasswordVisible ? eyeOffIcon : eyeIcon} alt="" width={18} height={18} />
          </button>
        )}
      </div>
      {message && (
        <p id={`${id}-message`} className={error ? styles.error : styles.helper}>
          {message}
        </p>
      )}
    </div>
  )
}
