import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { arrowUpIcon, closeIcon, linkIcon } from '@/shared/ui'
import { LIST_SEPARATOR, RANK_SEPARATOR } from '../model/script'
import type { ChoicePrompt } from '../model/types'
import card from './PromptCard.module.css'
import styles from './SelectCard.module.css'

interface SelectCardProps {
  prompt: ChoicePrompt
  onSubmit: (answer: string) => void
  onClose: () => void
}

const TITLE: Record<ChoicePrompt['kind'], string> = {
  single: '하나를 선택해 주세요',
  multi: '여러 개 선택해 주세요',
  ranked: '중요한 순서대로 눌러 주세요',
}

/**
 * 입력창 위에 뜨는 선택 창
 * - single: 누르면 바로 답이 된다
 * - multi: 여러 개 고르고 '선택 완료'
 * - ranked: 누른 순서가 번호로 붙는다
 */
export function SelectCard({ prompt, onSubmit, onClose }: SelectCardProps) {
  const { kind, options } = prompt
  // multi·ranked에서 고른 항목. ranked는 배열 순서가 곧 우선순위
  const [picked, setPicked] = useState<string[]>([])
  const [isEditingOther, setIsEditingOther] = useState(false)
  const [otherText, setOtherText] = useState('')
  const otherAnswer = otherText.trim()

  const toggle = (option: string) => {
    if (kind === 'single') {
      onSubmit(option)
      return
    }
    setPicked((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
    )
  }

  const answers = isEditingOther && otherAnswer ? [...picked, otherAnswer] : picked
  const canSubmit = answers.length > 0

  const submit = () => {
    if (!canSubmit) return
    onSubmit(answers.join(kind === 'ranked' ? RANK_SEPARATOR : LIST_SEPARATOR))
  }

  const submitOther = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (kind === 'single') {
      if (otherAnswer) onSubmit(otherAnswer)
      return
    }
    submit()
  }

  const handleOtherKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsEditingOther(false)
      setOtherText('')
    }
  }

  return (
    <div className={card.card} role="group" aria-labelledby="select-card-title">
      <div className={card.header}>
        <p id="select-card-title" className={card.title}>
          {TITLE[kind]}
        </p>
        <button type="button" className={card.close} aria-label="닫기" onClick={onClose}>
          <img src={closeIcon} alt="" width={12} height={12} />
        </button>
      </div>

      <ul className={styles.list}>
        {options.map((option, index) => {
          const rank = picked.indexOf(option)
          const selected = rank >= 0
          return (
            <li key={option}>
              <button
                type="button"
                className={[styles.option, selected && styles.selected].filter(Boolean).join(' ')}
                aria-pressed={kind === 'single' ? undefined : selected}
                onClick={() => toggle(option)}
              >
                <span className={styles.badge}>
                  {kind === 'ranked' ? (selected ? rank + 1 : '') : index + 1}
                </span>
                <span className={styles.label}>{option}</span>
              </button>
            </li>
          )
        })}
        {kind !== 'ranked' && (
          <li>
            {isEditingOther ? (
              <form className={[styles.option, styles.selected].join(' ')} onSubmit={submitOther}>
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
                {kind === 'single' && otherAnswer && (
                  <button type="submit" className={styles.send} aria-label="보내기">
                    <img src={arrowUpIcon} alt="" width={14} height={14} />
                  </button>
                )}
              </form>
            ) : (
              <button
                type="button"
                className={styles.option}
                onClick={() => setIsEditingOther(true)}
              >
                <span className={styles.badge}>
                  <img src={linkIcon} alt="" width={13} height={13} />
                </span>
                <span className={[styles.label, styles.placeholder].join(' ')}>
                  기타 (직접 입력)
                </span>
              </button>
            )}
          </li>
        )}
      </ul>

      {kind !== 'single' && (
        <button type="button" className={card.submit} disabled={!canSubmit} onClick={submit}>
          선택 완료
        </button>
      )}
    </div>
  )
}
