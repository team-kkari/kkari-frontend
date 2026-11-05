import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import {
  CUSTOMER_SERVICE_STAGE_LABEL,
  customerServiceQueries,
  type CustomerServiceStage,
} from '@/entities/customer-service'
import { ApiError } from '@/shared/api'
import { formatDate } from '@/shared/lib'
import { checkCircleIcon, circleEmptyIcon, infoCircleIcon } from '@/shared/ui'
import { listServiceAnswers } from '../model/serviceAnswers'
import styles from './ServiceStatusView.module.css'

const STAGES: { stage: CustomerServiceStage; description: string }[] = [
  { stage: 'RECEIVED', description: '담당 엔지니어 확인 중' },
  { stage: 'ANALYZED', description: '현재 인프라 분석' },
  { stage: 'RECOMMENDED', description: '추천 구조 준비' },
]

const NOTICE: Record<CustomerServiceStage, string> = {
  RECEIVED: '접수됐어요. 담당 엔지니어가 내용을 확인하고 AWS 연결 등 다음 단계를 진행해요',
  ANALYZED: '현재 인프라 분석이 끝났어요. 담당 엔지니어가 추천 구조를 준비하고 있어요',
  RECOMMENDED: '추천 구조가 준비됐어요. 아래에서 추천 결과를 확인해 보세요',
}

const RESULT_DESCRIPTION: Record<CustomerServiceStage, string> = {
  RECEIVED: '추천이 끝나면 여기에서 결과를 볼 수 있어요',
  ANALYZED: '추천이 끝나면 여기에서 결과를 볼 수 있어요',
  RECOMMENDED: '추천 아키텍처와 예상 비용, 구성도를 확인할 수 있어요',
}

/** 접수 후 진행 상태 (G-6) */
export function ServiceStatusView({ serviceId }: { serviceId: number }) {
  const {
    data: service,
    isPending,
    error,
    refetch,
  } = useQuery(customerServiceQueries.detail(serviceId))

  if (isPending) {
    return (
      <section className={styles.view}>
        <p role="status" className={styles.message}>
          서비스 정보를 불러오는 중…
        </p>
      </section>
    )
  }

  if (!service) {
    return (
      <section className={styles.view}>
        <div role="alert" className={styles.errorBox}>
          <p className={styles.errorMessage}>
            {error instanceof ApiError ? error.message : '서비스 정보를 불러오지 못했어요.'}
          </p>
          <button type="button" className={styles.retryButton} onClick={() => void refetch()}>
            다시 시도
          </button>
        </div>
      </section>
    )
  }

  const { serviceName, engineerName, createdAt, stage, answers } = service
  const currentIndex = STAGES.findIndex((item) => item.stage === stage)
  const rows = listServiceAnswers(answers)

  return (
    <section className={styles.view}>
      <header className={styles.header}>
        <h1 className={styles.title}>{serviceName}</h1>
        <p className={styles.meta}>
          담당 {engineerName} | 등록일 {formatDate(createdAt)}
        </p>
      </header>

      <p className={styles.notice}>
        <img src={infoCircleIcon} alt="" width={16} height={16} />
        {NOTICE[stage]}
      </p>

      <section className={styles.card} aria-labelledby="service-stages-title">
        <h2 id="service-stages-title" className={styles.cardTitle}>
          진행 단계
        </h2>
        <ol className={styles.stages}>
          {STAGES.map((item, index) => {
            const done = index <= currentIndex
            return (
              <li
                key={item.stage}
                className={[styles.stage, !done && styles.pending].filter(Boolean).join(' ')}
                aria-current={index === currentIndex ? 'step' : undefined}
              >
                <img src={done ? checkCircleIcon : circleEmptyIcon} alt="" width={18} height={18} />
                <span className={styles.stageText}>
                  <span className={styles.stageLabel}>
                    {CUSTOMER_SERVICE_STAGE_LABEL[item.stage]}
                  </span>
                  <span className={styles.stageDescription}>{item.description}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </section>

      <section className={[styles.card, styles.resultCard].join(' ')}>
        <h2 className={styles.cardTitle}>추천 결과</h2>
        <p className={styles.resultDescription}>{RESULT_DESCRIPTION[stage]}</p>
        {stage === 'RECOMMENDED' && (
          <Link to={`/desk/services/${serviceId}/result`} className={styles.resultLink}>
            추천 결과 보기
          </Link>
        )}
      </section>

      {rows.length > 0 && (
        <section className={[styles.card, styles.answersCard].join(' ')}>
          <h2 className={styles.cardTitle}>내 답변</h2>
          <dl className={styles.answers}>
            {rows.map(([question, answer]) => (
              <div key={question} className={styles.row}>
                <dt className={styles.rowLabel}>{question}</dt>
                <dd className={styles.rowValue}>{answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </section>
  )
}
