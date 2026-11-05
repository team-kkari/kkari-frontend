import { checkCircleIcon, circleEmptyIcon } from '@/shared/ui'
import { INFO_ITEMS } from '../model/script'
import type { Answers, Engineer } from '../model/types'
import styles from './InfoPanel.module.css'

interface InfoPanelProps {
  answers: Answers
  engineer?: Engineer
}

export function InfoPanel({ answers, engineer }: InfoPanelProps) {
  const items = [
    ...INFO_ITEMS.map((item) => ({
      label: item.label,
      done: item.fields.every((field) => answers[field]),
      value: item.summarize(answers),
    })),
    {
      label: '담당 엔지니어',
      done: !!engineer,
      value: engineer && `${engineer.name} · ${engineer.company}`,
    },
  ]
  const doneCount = items.filter((item) => item.done).length
  const total = items.length

  return (
    <aside className={styles.panel} aria-label="수집한 정보">
      <div className={styles.header}>
        <h2 className={styles.title}>수집한 정보</h2>
        <span className={styles.count}>
          {doneCount}/{total}
        </span>
      </div>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label="수집 진행률"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={doneCount}
      >
        <div className={styles.bar} style={{ width: `${(doneCount / total) * 100}%` }} />
      </div>
      <ul className={styles.list}>
        {items.map(({ label, done, value }) => (
          <li key={label} className={styles.item}>
            <img src={done ? checkCircleIcon : circleEmptyIcon} alt="" width={18} height={18} />
            <div className={styles.text}>
              <span className={done || value ? styles.label : styles.labelPending}>{label}</span>
              {value && <span className={styles.value}>{value}</span>}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
