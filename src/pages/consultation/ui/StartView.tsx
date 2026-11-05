import { useState } from 'react'
import { SUGGESTIONS } from '../model/script'
import { MessageInput } from './MessageInput'
import styles from './StartView.module.css'

export interface StartValues {
  companyName: string
  contactName: string
  message: string
}

interface StartViewProps {
  onStart: (values: StartValues) => void
  /** 의뢰를 만드는 중이면 입력을 막는다 */
  pending?: boolean
  error?: string | null
}

export function StartView({ onStart, pending = false, error }: StartViewProps) {
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [text, setText] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)

  const handleSubmit = (message: string) => {
    const company = companyName.trim()
    const contact = contactName.trim()
    if (!company || !contact) {
      setFieldError('고객사 이름과 담당자 이름을 입력해 주세요.')
      return
    }
    setFieldError(null)
    onStart({ companyName: company, contactName: contact, message })
  }

  const message = fieldError ?? error

  return (
    <section className={styles.view}>
      <div className={styles.hero}>
        <h1 className={styles.title}>어떤 인프라 고민이 있나요?</h1>
        <p className={styles.description}>
          고객사 상황을 알려주시면 AI가 질문하면서 필요한 정보를 모아요
        </p>
      </div>
      <div className={styles.fields}>
        <input
          className={styles.field}
          aria-label="고객사 이름"
          placeholder="고객사 이름"
          maxLength={100}
          value={companyName}
          disabled={pending}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <input
          className={styles.field}
          aria-label="담당자 이름"
          placeholder="고객사 담당자 이름"
          maxLength={50}
          value={contactName}
          disabled={pending}
          onChange={(e) => setContactName(e.target.value)}
        />
      </div>
      <MessageInput
        className={styles.input}
        placeholder="예: 월 클라우드 비용이 너무 많이 나와요"
        value={text}
        disabled={pending}
        onValueChange={setText}
        onSubmit={handleSubmit}
      />
      {message && (
        <p role="alert" className={styles.error}>
          {message}
        </p>
      )}
      <ul className={styles.suggestions}>
        {SUGGESTIONS.map((suggestion) => (
          <li key={suggestion}>
            <button type="button" className={styles.chip} onClick={() => setText(suggestion)}>
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
