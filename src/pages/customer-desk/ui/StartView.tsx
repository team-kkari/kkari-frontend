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
        <h1 className={styles.title}>어떤 고민이 있어서 찾아오셨나요?</h1>
        <p className={styles.description}>
          대화로 답해 주시면, 담당 엔지니어에게 전달할 내용을 AI가 정리해요
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
            <button type="button" className={styles.chip} onClick={() => onStart(suggestion)}>
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
