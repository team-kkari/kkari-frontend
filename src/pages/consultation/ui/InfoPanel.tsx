import { checkCircleIcon, circleEmptyIcon } from '@/shared/ui'
import { INFO_ITEMS } from '../model/script'
import type { CollectedInfo } from '../model/types'
import styles from './InfoPanel.module.css'

interface InfoPanelProps {
  info: CollectedInfo
  /** AI 가 아직 확인하지 못한 항목의 표시명 */
  missing?: string[]
}

export function InfoPanel({ info, missing = [] }: InfoPanelProps) {
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
      {missing.length > 0 && (
        <section className={styles.missing} aria-label="더 확인할 항목">
          <h3 className={styles.missingTitle}>더 확인할 항목</h3>
          <ul className={styles.missingList}>
            {missing.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  )
}
