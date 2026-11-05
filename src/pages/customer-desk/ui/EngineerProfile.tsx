import type { Engineer } from '@/entities/engineer'
import styles from './EngineerProfile.module.css'

/** 이름 첫 글자 동그라미 + 이름 + 회사 */
export function EngineerProfile({ engineer }: { engineer: Engineer }) {
  return (
    <span className={styles.profile}>
      <span className={styles.avatar} aria-hidden="true">
        {engineer.name.slice(0, 1)}
      </span>
      <span className={styles.text}>
        <span className={styles.name}>{engineer.name}</span>
        <span className={styles.company}>{engineer.companyName}</span>
      </span>
    </span>
  )
}
