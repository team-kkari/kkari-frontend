import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import styles from './MspProjectsPage.module.css'

interface StateMessageProps {
  children: ReactNode
  /** 오류면 빨갛게 보여주고 스크린리더에 바로 알린다 */
  error?: boolean
  /** 있으면 "다시 시도" 버튼을 보여준다 */
  onRetry?: () => void
  /** 같이 보여줄 추가 동작 (예: 목록으로 돌아가기 링크) */
  action?: ReactNode
}

/** 불러오는 중·비어 있음·오류 안내 */
export function StateMessage({ children, error = false, onRetry, action }: StateMessageProps) {
  return (
    <div
      className={cx(styles.stateBox, error && styles.stateError)}
      role={error ? 'alert' : 'status'}
    >
      <p>{children}</p>
      {(onRetry || action) && (
        <div className={styles.stateActions}>
          {onRetry && (
            <button type="button" className={styles.retryButton} onClick={onRetry}>
              다시 시도
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  )
}
