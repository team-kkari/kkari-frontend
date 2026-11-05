import { checkCircleIcon, circleEmptyIcon } from '@/shared/ui'
import { INFO_ITEMS } from '../model/script'
import type { CollectedInfo } from '../model/types'
import styles from './InfoPanel.module.css'

interface InfoPanelProps {
  info: CollectedInfo
}

export function InfoPanel({ info }: InfoPanelProps) {
  const collectedCount = INFO_ITEMS.filter(({ key }) => info[key]).length
  const total = INFO_ITEMS.length

  return (
    <aside className={styles.panel} aria-label="수집한 정보">
      <div className={styles.header}>
        <h2 className={styles.title}>수집한 정보</h2>
        <span className={styles.count}>
          {collectedCount}/{total}
        </span>
      </div>
      <div
        className={styles.progress}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={collectedCount}
      >
        <div className={styles.bar} style={{ width: `${(collectedCount / total) * 100}%` }} />
      </div>
      <ul className={styles.list}>
        {INFO_ITEMS.map(({ key, label }) => {
          const value = info[key]
          return (
            <li key={key} className={styles.item}>
              <img src={value ? checkCircleIcon : circleEmptyIcon} alt="" width={18} height={18} />
              <div className={styles.text}>
                <span className={value ? styles.label : styles.labelPending}>{label}</span>
                {value && <span className={styles.value}>{value}</span>}
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
