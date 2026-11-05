import { INFO_ITEMS } from '../model/script'
import type { CollectedInfo } from '../model/types'
import card from './ActionCard.module.css'
import styles from './ConfirmCard.module.css'

interface ConfirmCardProps {
  info: CollectedInfo
  done: boolean
  onConfirm: () => void
}

/** 수집한 정보를 한 번 확인하고 설계를 시작하는 카드 */
export function ConfirmCard({ info, done, onConfirm }: ConfirmCardProps) {
  return (
    <div className={[card.card, done && card.done].filter(Boolean).join(' ')}>
      <p className={card.title}>이렇게 정리했어요</p>
      <dl className={styles.list}>
        {INFO_ITEMS.map(({ key, label }) => (
          <div key={key} className={styles.row}>
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.value}>{info[key] ?? '-'}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        className={[card.primaryButton, done && card.completed].filter(Boolean).join(' ')}
        disabled={done}
        onClick={onConfirm}
      >
        이대로 설계 시작
      </button>
    </div>
  )
}
