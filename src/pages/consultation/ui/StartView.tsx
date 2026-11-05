import { useState } from 'react'
import { SUGGESTIONS } from '../model/script'
import { MessageInput } from './MessageInput'
import styles from './StartView.module.css'

interface StartViewProps {
  onStart: (text: string) => void
}

export function StartView({ onStart }: StartViewProps) {
  const [text, setText] = useState('')

  return (
    <section className={styles.view}>
      <div className={styles.hero}>
        <h1 className={styles.title}>어떤 인프라 고민이 있나요?</h1>
        <p className={styles.description}>
          고객사 상황을 알려주시면 AI가 질문하면서 필요한 정보를 모아요
        </p>
      </div>
      <MessageInput
        className={styles.input}
        placeholder="예: 월 클라우드 비용이 너무 많이 나와요"
        value={text}
        onValueChange={setText}
        onSubmit={onStart}
      />
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
