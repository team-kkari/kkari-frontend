import { useEffect, useRef, useState, type FormEvent } from 'react'
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
  // 보낼 때마다 바뀌어서 화살표 애니메이션을 다시 재생한다
  const [sendCount, setSendCount] = useState(0)
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
    setSendCount((n) => n + 1)
  }

  return (
    <form className={[styles.form, className].filter(Boolean).join(' ')} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className={styles.input}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="메시지 입력"
        onChange={(event) => setText(event.target.value)}
      />
      <button type="submit" className={styles.send} disabled={!canSubmit} aria-label="보내기">
        <img
          key={sendCount}
          className={sendCount > 0 ? styles.launch : undefined}
          src={arrowUpIcon}
          alt=""
          width={18}
          height={18}
        />
      </button>
    </form>
  )
}
