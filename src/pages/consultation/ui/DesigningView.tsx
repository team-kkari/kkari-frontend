import { useEffect, useRef, useState } from 'react'
import { checkCircleIcon, circleEmptyIcon, spinnerLargeIcon, spinnerSmallIcon } from '@/shared/ui'
import { DESIGN_COMPLETE_DELAY, DESIGN_STEPS, DESIGN_STEP_DELAY } from '../model/script'
import styles from './DesigningView.module.css'

interface DesigningViewProps {
  /** 모든 설계 단계가 끝났을 때 (결과 화면으로 이동) */
  onComplete: () => void
}

export function DesigningView({ onComplete }: DesigningViewProps) {
  // 진행 중인 단계 인덱스. 단계 수와 같으면 모두 완료
  const [activeIndex, setActiveIndex] = useState(0)

  // 부모 콜백은 렌더마다 새로 만들어지므로 ref로 최신 값만 참조한다
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    if (activeIndex >= DESIGN_STEPS.length) {
      // 마지막 단계 완료 표시를 잠깐 보여준 뒤 넘어간다
      const timer = window.setTimeout(() => onCompleteRef.current(), DESIGN_COMPLETE_DELAY)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => setActiveIndex((i) => i + 1), DESIGN_STEP_DELAY)
    return () => window.clearTimeout(timer)
  }, [activeIndex])

  return (
    <section className={styles.view}>
      <img className={styles.spinner} src={spinnerLargeIcon} alt="" width={60} height={60} />
      <div className={styles.hero}>
        <h1 className={styles.title}>아키텍처를 설계하고 있어요...</h1>
        <p className={styles.description}>모은 정보와 AWS Best Practice를 바탕으로 만들고 있어요</p>
      </div>
      <ol className={styles.steps}>
        {DESIGN_STEPS.map((step, index) => {
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
              {state === 'done' && step.doneMeta && (
                <span className={styles.meta}>{step.doneMeta}</span>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
