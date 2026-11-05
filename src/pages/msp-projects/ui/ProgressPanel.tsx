import { Link } from 'react-router'
import { cx } from '../lib/cx'
import type { StepDone } from '../model/progress'
import { MSP_STEPS, stepPath, type StepKey } from '../model/steps'
import styles from './MspProjectsPage.module.css'

interface ProgressPanelProps {
  projectId: number
  /** 지금 보고 있는 단계 */
  active: StepKey
  done: StepDone
}

/** 오른쪽 "진행 순서". 실제 진행 상태에 맞춰 완료 표시를 하고, 누르면 그 단계로 이동한다 */
export function ProgressPanel({ projectId, active, done }: ProgressPanelProps) {
  return (
    <aside className={styles.progress}>
      <h2>진행 순서</h2>
      {MSP_STEPS.map((step) => (
        <Link
          key={step.key}
          to={stepPath(projectId, step.key)}
          className={cx(
            styles.progressItem,
            done[step.key] && styles.doneStep,
            step.key === active && styles.activeStep,
          )}
          aria-current={step.key === active ? 'step' : undefined}
        >
          <span className={styles.stepIcon} aria-hidden="true">
            {done[step.key] ? '✓' : ''}
          </span>
          {step.label}
          {done[step.key] && <span className={styles.srOnly}> (완료)</span>}
        </Link>
      ))}
    </aside>
  )
}
