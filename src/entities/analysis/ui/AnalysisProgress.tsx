import type { Job } from '@/shared/api'
import { checkCircleIcon, circleEmptyIcon, spinnerSmallIcon } from '@/shared/ui'
import { ANALYSIS_STEPS } from '../model/types'
import styles from './AnalysisProgress.module.css'

type StepState = 'done' | 'active' | 'failed' | 'pending'

function getStepStates(job: Pick<Job, 'status' | 'step'> | undefined): StepState[] {
  const allPending = ANALYSIS_STEPS.map((): StepState => 'pending')
  if (!job || job.status === 'QUEUED') return allPending
  if (job.status === 'SUCCEEDED') return ANALYSIS_STEPS.map((): StepState => 'done')

  const current = ANALYSIS_STEPS.findIndex(({ step }) => step === job.step)
  // 실패했는데 어느 단계인지 모르면 단계 표시를 하지 않는다
  if (job.status === 'FAILED' && current < 0) return allPending

  const at = Math.max(current, 0)
  return ANALYSIS_STEPS.map((_, index): StepState => {
    if (index < at) return 'done'
    if (index > at) return 'pending'
    return job.status === 'FAILED' ? 'failed' : 'active'
  })
}

function getCaption(job: Pick<Job, 'status'> | undefined) {
  if (!job || job.status === 'QUEUED') return '분석을 준비하고 있어요'
  if (job.status === 'RUNNING') return '고객사 AWS를 분석하고 있어요. 조금 걸릴 수 있어요'
  if (job.status === 'SUCCEEDED') return '분석을 마쳤어요'
  return null
}

interface AnalysisProgressProps {
  /** 작업 상태. 아직 조회 전이면 비워 둔다 (대기 중으로 보여준다) */
  job: Pick<Job, 'status' | 'step'> | undefined
}

/** 인프라 분석 작업의 단계(구조 → 사용률 → 비용)별 진행 상황 */
export function AnalysisProgress({ job }: AnalysisProgressProps) {
  const states = getStepStates(job)
  const caption = getCaption(job)

  return (
    <div className={styles.progress}>
      <ol className={styles.steps} aria-label="분석 진행 상황">
        {ANALYSIS_STEPS.map(({ step, label }, index) => {
          const state = states[index]
          return (
            <li key={step} className={[styles.step, styles[state]].filter(Boolean).join(' ')}>
              <img
                className={state === 'active' ? styles.spinner : undefined}
                src={
                  state === 'done'
                    ? checkCircleIcon
                    : state === 'active'
                      ? spinnerSmallIcon
                      : circleEmptyIcon
                }
                alt=""
                width={18}
                height={18}
              />
              {label}
            </li>
          )
        })}
      </ol>
      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  )
}
