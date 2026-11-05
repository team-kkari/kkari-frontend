import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { arrowUpIcon, closeIcon, linkIcon } from '@/shared/ui'
import styles from './QuickReplyPanel.module.css'

interface QuickReplyPanelProps {
  options: string[]
  /** 항목 선택 또는 '기타'에 직접 입력한 값 */
  onSelect: (answer: string) => void
  onClose: () => void
}

export function QuickReplyPanel({ options, onSelect, onClose }: QuickReplyPanelProps) {
  const [isEditingOther, setIsEditingOther] = useState(false)
  const [otherText, setOtherText] = useState('')
  const trimmed = otherText.trim()

  const submitOther = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (trimmed) onSelect(trimmed)
  }

  const handleOtherKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsEditingOther(false)
      setOtherText('')
    }
  }

  return (
    <div className={styles.panel} role="group" aria-labelledby="quick-reply-title">
      <div className={styles.header}>
        <p id="quick-reply-title" className={styles.title}>
          하나를 선택해 주세요
        </p>
        <button type="button" className={styles.close} aria-label="닫기" onClick={onClose}>
          <img src={closeIcon} alt="" width={12} height={12} />
        </button>
      </div>
      <ul className={styles.list}>
        {options.map((option, index) => (
          <li key={option}>
            <button type="button" className={styles.option} onClick={() => onSelect(option)}>
              <span className={styles.badge}>{index + 1}</span>
              {option}
            </button>
          </li>
        ))}
        <li>
          {isEditingOther ? (
            <form className={[styles.option, styles.otherForm].join(' ')} onSubmit={submitOther}>
              <span className={styles.badge}>
                <img src={linkIcon} alt="" width={13} height={13} />
              </span>
              <input
                className={styles.otherInput}
                value={otherText}
                placeholder="직접 입력해 주세요"
                aria-label="기타 직접 입력"
                autoFocus
                onChange={(event) => setOtherText(event.target.value)}
                onKeyDown={handleOtherKeyDown}
              />
              {trimmed && (
                <button type="submit" className={styles.send} aria-label="보내기">
                  <img src={arrowUpIcon} alt="" width={14} height={14} />
                </button>
              )}
            </form>
          ) : (
            <button
              type="button"
              className={[styles.option, styles.other].join(' ')}
              onClick={() => setIsEditingOther(true)}
            >
              <span className={styles.badge}>
                <img src={linkIcon} alt="" width={13} height={13} />
              </span>
              기타
            </button>
          )}
        </li>
      </ul>
    </div>
  )
}
