import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cx } from '../lib/cx'
import { previousStep, stepPath, type StepKey } from '../model/steps'
import styles from './MspProjectsPage.module.css'

interface StepFooterProps {
  projectId: number
  step: StepKey
  /** 오른쪽에 놓을 동작 버튼들 */
  children?: ReactNode
}

/** 단계 화면 아래의 이전 / 다음 동작 줄 */
export function StepFooter({ projectId, step, children }: StepFooterProps) {
  const previous = previousStep(step)
  return (
    <footer className={styles.footer}>
      {previous && (
        <Link className={cx(styles.footerButton, styles.back)} to={stepPath(projectId, previous)}>
          이전
        </Link>
      )}
      {children}
    </footer>
  )
}
