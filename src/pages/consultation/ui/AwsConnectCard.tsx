import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { AnalysisProgress, useAnalysisJob, useStartAnalysis } from '@/entities/analysis'
import {
  AWS_CONNECTION_STATUS_GUIDE,
  ROLE_ARN_ERROR,
  formatTrustPolicy,
  isRoleArn,
  useAwsConnection,
  useConnectAwsRole,
} from '@/entities/aws-connection'
import { ApiError } from '@/shared/api'
import { copyIcon } from '@/shared/ui'
import card from './ActionCard.module.css'
import styles from './AwsConnectCard.module.css'

const errorMessage = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'

/** 클립보드에 복사한다. http 로 접속하면 Clipboard API 를 쓸 수 없어 execCommand 로 대신한다 */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.append(textarea)
    textarea.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      textarea.remove()
    }
  }
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [result, setResult] = useState<'copied' | 'failed' | null>(null)
  const timer = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const handleCopy = async () => {
    setResult((await copyText(value)) ? 'copied' : 'failed')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setResult(null), 1500)
  }

  const text = result === 'copied' ? '복사됨' : result === 'failed' ? '복사 실패' : null

  return (
    <button
      type="button"
      className={styles.copy}
      onClick={handleCopy}
      aria-label={text ?? `${label} 복사`}
      title={text ?? '복사'}
    >
      {text ? (
        <span className={result === 'failed' ? styles.copyFailed : styles.copied}>{text}</span>
      ) : (
        <img src={copyIcon} alt="" width={20} height={20} />
      )}
    </button>
  )
}

interface CopyFieldProps {
  label: string
  value: string
}

function CopyField({ label, value }: CopyFieldProps) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.box}>
        <span className={styles.value}>{value}</span>
        <CopyButton label={label} value={value} />
      </div>
    </div>
  )
}

interface AwsConnectCardProps {
  /** 연결할 프로젝트(의뢰) */
  projectId: number
  done: boolean
  /** 완료된 카드에 보여줄, 연결에 쓴 Role ARN */
  savedRoleArn?: string
  /** 연결 테스트와 인프라 분석이 모두 끝나면 한 번 호출한다 */
  onConnected: (roleArn: string) => void
}

/**
 * 고객사 AWS 계정 연결 카드.
 * External ID·신뢰 정책을 보여주고 → Role ARN 등록·연결 테스트 → 성공하면 인프라 분석을 시작해
 * 진행 상황을 보여준다. 분석이 SUCCEEDED 가 되면 onConnected 를 호출한다.
 */
export function AwsConnectCard({
  projectId,
  done,
  savedRoleArn,
  onConnected,
}: AwsConnectCardProps) {
  // 완료된 카드는 서버에 묻지 않는다 (목업 의뢰에는 실제 프로젝트가 없다)
  const connectionQuery = useAwsConnection(projectId, !done)
  const connection = connectionQuery.data
  const connect = useConnectAwsRole(projectId)
  const analysis = useStartAnalysis(projectId)
  const jobId = analysis.data?.jobId
  const jobQuery = useAnalysisJob(jobId)
  const job = jobQuery.data

  // null 이면 아직 입력하지 않은 것: 서버에 등록된 ARN(없으면 저장된 ARN)을 보여준다
  const [typedRoleArn, setTypedRoleArn] = useState<string | null>(null)
  const [validationError, setValidationError] = useState('')

  const inputValue = typedRoleArn ?? connection?.roleArn ?? savedRoleArn ?? ''
  const roleArn = inputValue.trim()

  // 입력한 ARN 이 서버에 등록된 ARN 과 같을 때만 서버의 연결 상태를 믿는다
  const status = connection && connection.roleArn === roleArn ? connection.status : 'NOT_CONNECTED'
  const guide = AWS_CONNECTION_STATUS_GUIDE[status]

  const isStartingAnalysis = analysis.isPending
  const analysisFailed = job?.status === 'FAILED'
  const analysisSucceeded = job?.status === 'SUCCEEDED'
  const isAnalyzing =
    isStartingAnalysis ||
    (jobId !== undefined && !analysisFailed && !analysisSucceeded && !(jobQuery.isError && !job))
  const locked = done || connect.isPending || isAnalyzing || analysisSucceeded

  // 분석이 끝나면 대화를 다음 단계로 넘긴다 (한 번만)
  const notified = useRef(false)
  useEffect(() => {
    if (!analysisSucceeded || notified.current) return
    notified.current = true
    onConnected(roleArn)
  }, [analysisSucceeded, onConnected, roleArn])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTypedRoleArn(event.target.value)
    setValidationError('')
    if (connect.isError) connect.reset()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (locked) return

    // 이미 연결된 Role 이면 분석만 (다시) 시작한다
    if (status === 'CONNECTED') {
      analysis.mutate()
      return
    }
    if (!isRoleArn(roleArn)) {
      setValidationError(ROLE_ARN_ERROR)
      return
    }
    setValidationError('')
    connect.mutate(roleArn, {
      onSuccess: (result) => {
        if (result.status === 'CONNECTED') analysis.mutate()
      },
    })
  }

  const buttonLabel = () => {
    if (done || analysisSucceeded) return '연결 완료'
    if (connect.isPending) return '연결 테스트 중...'
    if (isAnalyzing) return '분석 중...'
    if (status === 'CONNECTED')
      return analysisFailed || analysis.isError ? '분석 다시 시작' : '분석 시작'
    if (status === 'TRUST_POLICY_ERROR' || status === 'PERMISSION_DENIED') return '다시 테스트'
    return '연결 테스트'
  }

  // 요청 자체가 실패한 경우(네트워크·서버 오류)와 분석 작업이 실패한 경우의 안내 문구
  const actionError = connect.isError
    ? errorMessage(connect.error)
    : analysis.isError
      ? errorMessage(analysis.error)
      : analysisFailed
        ? (job.failureReason ?? '인프라 분석에 실패했어요. 다시 시도해 주세요.')
        : ''
  const showGuide = status !== 'NOT_CONNECTED' && !connect.isPending && !done
  const showSetup = !!connection || connectionQuery.isError || !done
  const showProgress = isStartingAnalysis || jobId !== undefined

  return (
    <form
      className={[card.card, done && card.done].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
    >
      <ol className={styles.steps}>
        {showSetup && (
          <li className={styles.step}>
            <p className={card.title}>1. 고객사에 이 값을 전달해주세요</p>
            {connection ? (
              <>
                <CopyField label="계정 ID" value={connection.accountId} />
                <CopyField label="External ID" value={connection.externalId} />
                {connection.trustPolicy && (
                  <details className={styles.policy}>
                    <summary className={styles.policySummary}>신뢰 정책(Trust policy) 보기</summary>
                    <div className={styles.policyBody}>
                      <pre className={styles.policyCode}>
                        {formatTrustPolicy(connection.trustPolicy)}
                      </pre>
                      <CopyButton
                        label="신뢰 정책"
                        value={formatTrustPolicy(connection.trustPolicy)}
                      />
                    </div>
                  </details>
                )}
              </>
            ) : connectionQuery.isError ? (
              <div className={styles.loadError}>
                <p className={card.error}>{errorMessage(connectionQuery.error)}</p>
                <button
                  type="button"
                  className={styles.retry}
                  onClick={() => void connectionQuery.refetch()}
                >
                  다시 불러오기
                </button>
              </div>
            ) : (
              <p className={card.hint}>연결 정보를 불러오는 중...</p>
            )}
          </li>
        )}
        <li className={styles.step}>
          <label className={card.title} htmlFor="role-arn">
            {showSetup ? '2. ' : ''}고객사가 준 Role ARN을 입력해 주세요
          </label>
          <input
            id="role-arn"
            className={[styles.box, styles.input, validationError && styles.invalid]
              .filter(Boolean)
              .join(' ')}
            value={inputValue}
            placeholder="arn:aws:iam::123456789012:role/..."
            disabled={locked}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? 'role-arn-error' : undefined}
            onChange={handleChange}
          />
          {validationError && (
            <p id="role-arn-error" className={card.error}>
              {validationError}
            </p>
          )}
        </li>
      </ol>

      {showGuide && (
        <div className={[styles.notice, styles[guide.tone]].join(' ')} role="status">
          <strong className={styles.noticeTitle}>{guide.title}</strong>
          <span>{guide.message}</span>
        </div>
      )}
      {showProgress && <AnalysisProgress job={job} />}
      {actionError && (
        <p className={card.error} role="alert">
          {actionError}
        </p>
      )}
      {jobQuery.isError && !analysisFailed && !analysisSucceeded && (
        <div className={styles.loadError}>
          <p className={card.error}>{errorMessage(jobQuery.error)}</p>
          <button type="button" className={styles.retry} onClick={() => void jobQuery.refetch()}>
            진행 상황 다시 불러오기
          </button>
        </div>
      )}

      <button
        type="submit"
        className={[card.primaryButton, (done || analysisSucceeded) && card.completed]
          .filter(Boolean)
          .join(' ')}
        disabled={locked || !roleArn}
      >
        {buttonLabel()}
      </button>
    </form>
  )
}
