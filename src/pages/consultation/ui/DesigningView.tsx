import { useEffect, useState } from 'react'
import { checkCircleIcon, circleEmptyIcon, spinnerLargeIcon, spinnerSmallIcon } from '@/shared/ui'
import { DESIGN_STEPS, DESIGN_STEP_DELAY, TEMP_FINISH_DELAY } from '../model/script'
import styles from './DesigningView.module.css'

interface DesigningViewProps {
  /** [임시] 결과 화면이 생기기 전까지 끝내기 버튼으로 의뢰를 마친다 */
  onFinish: () => void
}

export function DesigningView({ onFinish }: DesigningViewProps) {
  // 진행 중인 단계 인덱스. 단계 수와 같으면 모두 완료
  const [activeIndex, setActiveIndex] = useState(0)
  const [showFinish, setShowFinish] = useState(false)

  // [임시] 결과 화면 연결 전까지 5초 뒤 끝내기 버튼을 띄운다
  useEffect(() => {
    const timer = window.setTimeout(() => setShowFinish(true), TEMP_FINISH_DELAY)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (activeIndex >= DESIGN_STEPS.length) return
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

      {/* [임시] 결과 화면이 생기면 이 블록을 지운다 */}
      {showFinish && (
        <div className={styles.tempFinish}>
          <button type="button" className={styles.finishButton} onClick={onFinish}>
            끝내기
          </button>
          <p className={styles.tempNote}>임시 버튼이에요 · 결과 화면 연결 전까지만 사용해요</p>
        </div>
      )}
    </section>
  )
}
