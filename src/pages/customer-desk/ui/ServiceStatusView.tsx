import type { CustomerServiceStatus } from '@/widgets/customer-sidebar'
import { checkCircleIcon, circleEmptyIcon, infoCircleIcon } from '@/shared/ui'
import type { FieldKey, ServiceRecord } from '../model/types'
import styles from './ServiceStatusView.module.css'

const STAGES: { status: CustomerServiceStatus; label: string; description: string }[] = [
  { status: 'submitted', label: '접수됨', description: '담당 엔지니어 확인 중' },
  { status: 'analyzed', label: '분석 완료', description: '현재 인프라 분석' },
  { status: 'recommended', label: '추천 완료', description: '추천 구조 준비' },
]

const NOTICE: Record<CustomerServiceStatus, string> = {
  submitted: '접수됐어요. 담당 엔지니어가 내용을 확인하고 AWS 연결 등 다음 단계를 진행해요',
  analyzed: '현재 인프라 분석이 끝났어요. 담당 엔지니어가 추천 구조를 준비하고 있어요',
  recommended: '추천 구조가 준비됐어요. 담당 엔지니어가 결과를 안내해 드려요',
}

const RESULT_DESCRIPTION: Record<CustomerServiceStatus, string> = {
  submitted: '추천이 끝나면 여기에서 결과를 볼 수 있어요',
  analyzed: '추천이 끝나면 여기에서 결과를 볼 수 있어요',
  recommended: '담당 엔지니어가 결과를 정리하고 있어요. 곧 여기에서 볼 수 있어요',
}

/** 진행 상태 화면에서 다시 보여주는 핵심 답변 */
const ANSWER_ROWS: { field: FieldKey; label: string }[] = [
  { field: 'concern', label: '고민' },
  { field: 'priority', label: '우선순위' },
  { field: 'dailyUsers', label: '하루 사용자' },
  { field: 'frozenParts', label: '손대면 안 되는 부분' },
]

/** 접수 후 진행 상태 (G-6) */
export function ServiceStatusView({ service }: { service: ServiceRecord }) {
  const { name, engineer, registeredAt, status, answers } = service
  const currentIndex = STAGES.findIndex((stage) => stage.status === status)
  const rows = ANSWER_ROWS.filter(({ field }) => answers[field])

  return (
    <section className={styles.view}>
      <header className={styles.header}>
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.meta}>
          담당 {engineer.name} · {engineer.company} | 등록일 {registeredAt.replaceAll('-', '.')}
        </p>
      </header>

      <p className={styles.notice}>
        <img src={infoCircleIcon} alt="" width={16} height={16} />
        {NOTICE[status]}
      </p>

      <section className={styles.card} aria-labelledby="service-stages-title">
        <h2 id="service-stages-title" className={styles.cardTitle}>
          진행 단계
        </h2>
        <ol className={styles.stages}>
          {STAGES.map((stage, index) => {
            const done = index <= currentIndex
            return (
              <li
                key={stage.status}
                className={[styles.stage, !done && styles.pending].filter(Boolean).join(' ')}
                aria-current={index === currentIndex ? 'step' : undefined}
              >
                <img src={done ? checkCircleIcon : circleEmptyIcon} alt="" width={18} height={18} />
                <span className={styles.stageText}>
                  <span className={styles.stageLabel}>{stage.label}</span>
                  <span className={styles.stageDescription}>{stage.description}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </section>

      <section className={[styles.card, styles.resultCard].join(' ')}>
        <h2 className={styles.cardTitle}>추천 결과</h2>
        <p className={styles.resultDescription}>{RESULT_DESCRIPTION[status]}</p>
      </section>

      {rows.length > 0 && (
        <section className={[styles.card, styles.answersCard].join(' ')}>
          <h2 className={styles.cardTitle}>내 답변</h2>
          <dl className={styles.answers}>
            {rows.map(({ field, label }) => (
              <div key={field} className={styles.row}>
                <dt className={styles.rowLabel}>{label}</dt>
                <dd className={styles.rowValue}>{answers[field]}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </section>
  )
}
