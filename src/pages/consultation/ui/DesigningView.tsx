import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { projectQueries } from '@/entities/project'
import { useArchitectureGeneration, type GenerationPhase } from '@/entities/recommendation'
import { checkCircleIcon, circleEmptyIcon, spinnerLargeIcon, spinnerSmallIcon } from '@/shared/ui'
import styles from './DesigningView.module.css'

/** 마지막 단계 완료 표시를 잠깐 보여준 뒤 결과 화면으로 넘어가기 전 대기 시간 (ms) */
const COMPLETE_DELAY = 800

interface DesigningViewProps {
  projectId: number
  /** 이미 진행 중인 설계 작업. 있으면 새로 시작하지 않고 그 작업을 이어서 보여준다 */
  resumeJobId?: number
  /** 설계가 끝나고 결과를 받아왔을 때 (결과 화면으로 이동) */
  onDone: () => void
}

/** 진행 단계. 백엔드 작업은 대기 → 실행 → 완료만 알려 주므로 실제로 구분되는 흐름만 보여준다 */
const STEPS: { label: string; activeMeta?: string }[] = [
  { label: '설계 요청 전달' },
  { label: '아키텍처 설계', activeMeta: '보통 1~2분 걸려요' },
  { label: '결과 정리' },
]

/** 진행 중인 단계 인덱스. 단계 수와 같으면 모두 완료 */
function activeIndexOf(phase: GenerationPhase): number {
  switch (phase) {
    case 'idle':
    case 'starting':
    case 'failed':
      return 0
    case 'running':
      return 1
    case 'loading-result':
      return 2
    case 'done':
      return STEPS.length
  }
}

export function DesigningView({ projectId, resumeJobId, onDone }: DesigningViewProps) {
  const queryClient = useQueryClient()
  const { phase, error, start, retry } = useArchitectureGeneration(projectId, {
    resumeJobId,
  })

  // 부모 콜백은 렌더마다 새로 만들어지므로 ref로 최신 값만 참조한다
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })

  // 화면이 뜨면 바로 생성을 시작한다. 이어서 볼 작업(resumeJobId)이 있으면 새로 시작하지 않는다
  // (모르고 시작해도 대기·실행 중인 작업이 있으면 백엔드가 그 작업을 알려 준다)
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    start()
  }, [start])

  useEffect(() => {
    if (phase !== 'done') return
    // 의뢰 단계가 '추천 완료'로 바뀌었으니 목록·상세를 다시 받게 한다
    void queryClient.invalidateQueries({ queryKey: projectQueries.all() })
    const timer = window.setTimeout(() => onDoneRef.current(), COMPLETE_DELAY)
    return () => window.clearTimeout(timer)
  }, [phase, queryClient])

  if (phase === 'failed') {
    return (
      <section className={styles.view}>
        <div className={styles.hero}>
          <h1 className={styles.title}>아키텍처를 만들지 못했어요</h1>
          <p className={styles.description} role="alert">
            {error}
          </p>
        </div>
        <button type="button" className={styles.retry} onClick={retry}>
          다시 시도
        </button>
      </section>
    )
  }

  const activeIndex = activeIndexOf(phase)

  return (
    <section className={styles.view}>
      <img className={styles.spinner} src={spinnerLargeIcon} alt="" width={60} height={60} />
      <div className={styles.hero}>
        <h1 className={styles.title}>아키텍처를 설계하고 있어요...</h1>
        <p className={styles.description}>모은 정보와 AWS Best Practice를 바탕으로 만들고 있어요</p>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((step, index) => {
          const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending'
          const icon =
            state === 'done'
              ? checkCircleIcon
              : state === 'active'
                ? spinnerSmallIcon
                : circleEmptyIcon
          return (
            <li key={step.label} className={[styles.step, styles[state]].join(' ')}>
              <span className={styles.stepMain}>
                <img
                  className={state === 'active' ? styles.spinner : undefined}
                  src={icon}
                  alt=""
                  width={18}
                  height={18}
                />
                {step.label}
              </span>
              {state === 'active' && step.activeMeta && (
                <span className={styles.meta}>{step.activeMeta}</span>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
