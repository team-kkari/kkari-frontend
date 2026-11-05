import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ANSWER_VALUE_MAX_LENGTH } from '@/entities/customer-service'
import { arrowUpIcon } from '@/shared/ui'
import styles from './MessageInput.module.css'

interface MessageInputProps {
  placeholder: string
  disabled?: boolean
  value?: string
  onValueChange?: (value: string) => void
  onSubmit: (text: string) => void
  className?: string
}

/** 시작 화면·대화 화면 공용 입력창. value를 넘기면 제어 컴포넌트로 동작한다 */
export function MessageInput({
  placeholder,
  disabled,
  value,
  onValueChange,
  onSubmit,
  className,
}: MessageInputProps) {
  const [innerValue, setInnerValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const wasDisabled = useRef(disabled)

  // 비활성화(AI 답변 대기)가 풀리면 바로 이어서 입력할 수 있게 포커스를 돌려준다
  useEffect(() => {
    if (wasDisabled.current && !disabled) inputRef.current?.focus()
    wasDisabled.current = disabled
  }, [disabled])

  const text = value ?? innerValue
  const setText = onValueChange ?? setInnerValue
  const canSubmit = !disabled && text.trim().length > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(text.trim())
    setText('')
  }

  return (
    <form className={[styles.form, className].filter(Boolean).join(' ')} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className={styles.input}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={ANSWER_VALUE_MAX_LENGTH}
        aria-label="메시지 입력"
        onChange={(event) => setText(event.target.value)}
      />
      <button type="submit" className={styles.send} disabled={!canSubmit} aria-label="보내기">
        <img src={arrowUpIcon} alt="" width={18} height={18} />
      </button>
    </form>
  )
}
