import { useEffect, useRef, useState } from 'react'
import { waycoMarkIcon } from '@/shared/ui'
import type { ChatMessage, CollectedInfo, ConnectResult } from '../model/types'
import { AwsConnectCard } from './AwsConnectCard'
import { ChoiceCardView } from './ChoiceCardView'
import { ConfirmCard } from './ConfirmCard'
import { MessageInput } from './MessageInput'
import { QuickReplyPanel } from './QuickReplyPanel'
import { TerraformUploadCard } from './TerraformUploadCard'
import styles from './ChatView.module.css'

interface ChatViewProps {
  title: string
  projectId: number
  /** 완료된 의뢰: 기록만 보여주고 입력을 막는다 */
  done?: boolean
  /** 화면에 보이는 의뢰인지. 다시 보일 때 맨 아래로 스크롤한다 */
  active?: boolean
  messages: ChatMessage[]
  info: CollectedInfo
  isAiTyping: boolean
  canType: boolean
  /** 서버 오류 안내. 있으면 메시지 아래에 보여주고 다시 시도 버튼을 붙인다 */
  error?: string | null
  onRetry?: () => void
  onSend: (text: string) => void
  onConfirmChoice: (messageId: string, optionId: string) => void
  onCompleteConnect: (messageId: string, answer: string, result: ConnectResult) => void
  onSkipConnect: (messageId: string) => void
  onConfirmDesign: (messageId: string) => void
}

export function ChatView({
  title,
  projectId,
  done = false,
  active = true,
  messages,
  info,
  isAiTyping,
  canType,
  error,
  onRetry,
  onSend,
  onConfirmChoice,
  onCompleteConnect,
  onSkipConnect,
  onConfirmDesign,
}: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isAiTyping, error])

  useEffect(() => {
    if (active) bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [active])

  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  const lastMessage = messages[messages.length - 1]
  const quickReplies =
    !done && lastMessage?.role === 'ai' && !isAiTyping && !dismissedIds.includes(lastMessage.id)
      ? lastMessage.quickReplies
      : undefined

  const dismissQuickReplies = () => {
    if (lastMessage) setDismissedIds((prev) => [...prev, lastMessage.id])
  }

  return (
    <section className={styles.view}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{done ? '완료' : '의뢰 접수 중'}</p>
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
              <p className={styles.aiText}>{message.text}</p>
              {message.choice && (
                <ChoiceCardView
                  choice={message.choice}
                  onConfirm={(optionId) => onConfirmChoice(message.id, optionId)}
                />
              )}
              {message.connect?.kind === 'aws' && (
                <AwsConnectCard
                  projectId={projectId}
                  done={!!message.connect.done}
                  savedRoleArn={message.connect.result?.roleArn}
                  onConnected={(roleArn) =>
                    onCompleteConnect(message.id, 'AWS 계정 연결', { roleArn })
                  }
                />
              )}
              {message.confirm && (
                <ConfirmCard
                  info={message.confirm.info ?? info}
                  done={!!message.confirm.done}
                  onConfirm={() => onConfirmDesign(message.id)}
                />
              )}
              {message.connect?.kind === 'terraform' && (
                <TerraformUploadCard
                  projectId={projectId}
                  done={!!message.connect.done}
                  savedFile={message.connect.result?.file}
                  onSkip={() => onSkipConnect(message.id)}
                  onStart={(file) =>
                    onCompleteConnect(message.id, `Terraform · ${file.name}`, {
                      file: { name: file.name, size: file.size },
                    })
                  }
                />
              )}
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
        {error && (
          <div role="alert" className={styles.errorRow}>
            <p className={styles.errorText}>{error}</p>
            {onRetry && (
              <button type="button" className={styles.retryButton} onClick={onRetry}>
                다시 시도
              </button>
            )}
          </div>
        )}
        <div ref={bottomRef} className={styles.bottomSpacer} />
      </div>

      <div className={styles.composer}>
        {quickReplies && (
          <QuickReplyPanel options={quickReplies} onSelect={onSend} onClose={dismissQuickReplies} />
        )}
        <MessageInput
          placeholder={
            done ? '완료된 의뢰예요' : canType ? '메시지를 입력하세요' : '잠시만 기다려 주세요'
          }
          disabled={done || !canType}
          onSubmit={onSend}
        />
      </div>
    </section>
  )
}

function AiMark() {
  return <img className={styles.mark} src={waycoMarkIcon} alt="" width={26} height={15} />
}
