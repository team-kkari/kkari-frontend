import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import styles from './MspProjectsPage.module.css'

interface NoticeProps {
  tone?: 'neutral' | 'success' | 'error'
  title?: string
  children?: ReactNode
}

/** 상태·다음 할 일 안내 상자 */
export function Notice({ tone = 'neutral', title, children }: NoticeProps) {
  return (
    <div className={cx(styles.notice, styles[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      {title && <strong className={styles.noticeTitle}>{title}</strong>}
      {children && <div className={styles.noticeBody}>{children}</div>}
    </div>
  )
}
