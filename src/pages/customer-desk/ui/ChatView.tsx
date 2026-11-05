import { useEffect, useRef, useState } from 'react'
import type { Engineer } from '@/entities/engineer'
import { BoldText, waycoMarkIcon } from '@/shared/ui'
import type { ChatMessage } from '../model/types'
import { EngineerPicker } from './EngineerPicker'
import { MessageInput } from './MessageInput'
import { SelectCard } from './SelectCard'
import styles from './ChatView.module.css'

interface ChatViewProps {
  messages: ChatMessage[]
  engineer?: Engineer
  isAiTyping: boolean
  canType: boolean
  onAnswer: (text: string) => void
  onChooseEngineer: (engineer: Engineer) => void
}

export function ChatView({
  messages,
  engineer,
  isAiTyping,
  canType,
  onAnswer,
  onChooseEngineer,
}: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  // 닫기(X)를 누른 선택 창. 닫으면 입력창에 직접 답할 수 있다
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isAiTyping])

  const lastMessage = messages[messages.length - 1]
  const pending = lastMessage?.role === 'ai' && !isAiTyping ? lastMessage : undefined
  const prompt = pending && !dismissedIds.includes(pending.id) ? pending.prompt : undefined
  const pickEngineer = !!pending?.pickEngineer

  return (
    <section className={styles.view}>
      <header className={styles.header}>
        <h1 className={styles.title}>새 서비스 등록</h1>
        <p className={styles.subtitle}>요구사항 파악 중</p>
      </header>

      <div className={styles.messages} aria-live="polite">
        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className={styles.userRow}>
              <p className={styles.userBubble}>{message.text}</p>
            </div>
          ) : (
            <div key={message.id} className={styles.aiGroup}>
              {message === lastMessage && !isAiTyping && <AiMark />}
              <p className={styles.aiText}>
                <BoldText>{message.text}</BoldText>
              </p>
            </div>
          ),
        )}
        {isAiTyping && (
          <div className={styles.aiGroup} aria-label="AI가 답변을 준비하고 있어요">
            <AiMark />
            <span className={styles.typingDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </div>
        )}
        <div ref={bottomRef} className={styles.bottomSpacer} />
      </div>

      <div className={styles.composer}>
        {prompt && pending && (
          <SelectCard
            key={pending.id}
            prompt={prompt}
            onSubmit={onAnswer}
            onClose={() => setDismissedIds((prev) => [...prev, pending.id])}
          />
        )}
        {pickEngineer && pending && (
          <EngineerPicker key={pending.id} initial={engineer} onSubmit={onChooseEngineer} />
        )}
        <MessageInput
          placeholder={
            pickEngineer
              ? '담당 엔지니어를 선택해 주세요'
              : canType
                ? '메시지를 입력해 주세요'
                : '잠시만 기다려 주세요'
          }
          disabled={!canType}
          onSubmit={onAnswer}
        />
      </div>
    </section>
  )
}

function AiMark() {
  return <img className={styles.mark} src={waycoMarkIcon} alt="" width={26} height={15} />
}
