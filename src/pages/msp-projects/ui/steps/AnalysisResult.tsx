import { useQuery } from '@tanstack/react-query'
import { analysisQueries } from '@/entities/analysis'
import { ApiError } from '@/shared/api'
import { formatDate } from '@/shared/lib'
import { errorMessage } from '../../lib/error-message'
import { formatPercent, formatUsd } from '../../lib/format'
import { summarizeSnapshot } from '../../model/analysis-summary'
import styles from '../MspProjectsPage.module.css'
import { StateMessage } from '../StateMessage'

interface AnalysisResultProps {
  projectId: number
}

/** 마지막으로 성공한 분석 결과: 월 예상 비용, 주요 리소스 수, 리소스별 사양·사용률·비용 */
export function AnalysisResult({ projectId }: AnalysisResultProps) {
  return (
    <>
      <h2 className={styles.sectionHeading}>분석 결과</h2>
      <ResultBody projectId={projectId} />
    </>
  )
}

function ResultBody({ projectId }: AnalysisResultProps) {
  const discovery = useQuery({
    ...analysisQueries.discovery(projectId),
    // 4xx(분석 결과 없음 AN003 등)는 다시 해도 같다
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status < 500) && failureCount < 1,
  })

  if (discovery.isPending) return <StateMessage>분석 결과를 불러오는 중…</StateMessage>

  if (discovery.isError) {
    // 아직 성공한 분석이 없으면 404(AN003)
    if (discovery.error instanceof ApiError && discovery.error.status === 404) {
      return <StateMessage>아직 분석 결과가 없어요. 위에서 분석을 시작해 주세요.</StateMessage>
    }
    return (
      <StateMessage error onRetry={() => void discovery.refetch()}>
        {errorMessage(discovery.error)}
      </StateMessage>
    )
  }

  const { analyzedAt, result } = discovery.data
  const summary = summarizeSnapshot(result)
  const missing = result.missing ?? []

  return (
    <>
      <p className={styles.resultCaption}>
        {formatDate(analyzedAt)} 분석 · {result.region} 리전 · 최근 {result.usage?.days ?? 14}일
        사용률, 온디맨드 정가 기준 추정 비용이에요
      </p>
      <div className={styles.metrics}>
        <div>
          <span>월 예상 비용</span>
          <b>{formatUsd(summary.totalCost)}</b>
        </div>
        <div>
          <span>EC2</span>
          <b>{summary.ec2Count}대</b>
        </div>
        <div>
          <span>평균 CPU</span>
          <b>{formatPercent(summary.avgCpu)}</b>
        </div>
        <div>
          <span>RDS</span>
          <b>{summary.rdsCount}개</b>
        </div>
      </div>
      {summary.costIsPartial && (
        <p className={styles.resultCaption}>
          일부 리소스는 구조나 비용을 수집하지 못해서 월 예상 비용이 실제보다 작을 수 있어요
        </p>
      )}
      {summary.rows.length > 0 ? (
        <div className={styles.resourceTable}>
          <div>
            <span>리소스</span>
            <span>스펙</span>
            <span>14일 평균 / p95</span>
            <span>월 비용</span>
          </div>
          {summary.rows.map((row) => (
            <div key={row.key}>
              <span>{row.name}</span>
              <span>{row.spec}</span>
              <span>{row.usage}</span>
              <span>{row.cost}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.resultCaption}>수집된 리소스가 없어요</p>
      )}
      {missing.length > 0 && (
        <details className={styles.missing}>
          <summary>수집하지 못한 항목 {missing.length}개</summary>
          <ul>
            {missing.map((item, index) => (
              <li key={`${item.target}-${index}`}>
                <b>{item.target}</b> {item.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  )
}
