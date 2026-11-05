import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import {
  AWS_CONNECTION_STATUS_GUIDE,
  ROLE_ARN_ERROR,
  formatTrustPolicy,
  isRoleArn,
  useAwsConnection,
  useConnectAwsRole,
} from '@/entities/aws-connection'
import { projectQueries, type ProjectDetail } from '@/entities/project'
import { errorMessage } from '../../lib/error-message'
import { stepPath } from '../../model/steps'
import { CopyButton } from '../CopyButton'
import { Field } from '../Field'
import styles from '../MspProjectsPage.module.css'
import { Notice } from '../Notice'
import { PageTitle } from '../PageTitle'
import { StateMessage } from '../StateMessage'
import { StepFooter } from '../StepFooter'

interface AwsStepProps {
  project: ProjectDetail
}

/**
 * AWS 연결: 고객사가 Role 신뢰 정책에 넣을 값(계정 ID·External ID)을 전달하고,
 * 고객사가 만든 Role ARN 을 등록해 연결을 테스트한다 (등록과 테스트는 한 번에 한다).
 */
export function AwsStep({ project }: AwsStepProps) {
  const { projectId } = project
  const queryClient = useQueryClient()
  const connectionQuery = useAwsConnection(projectId)
  const connection = connectionQuery.data
  const connect = useConnectAwsRole(projectId)

  // null 이면 아직 입력하지 않은 것: 서버에 등록된 ARN 을 보여준다
  const [typedRoleArn, setTypedRoleArn] = useState<string | null>(null)
  const [validationError, setValidationError] = useState('')

  const inputValue = typedRoleArn ?? connection?.roleArn ?? ''
  const roleArn = inputValue.trim()
  const isRegistered = !!connection?.roleArn && connection.roleArn === roleArn
  const guide = connection ? AWS_CONNECTION_STATUS_GUIDE[connection.status] : undefined

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTypedRoleArn(event.target.value)
    setValidationError('')
    if (connect.isError) connect.reset()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (connect.isPending) return
    if (!isRoleArn(roleArn)) {
      setValidationError(ROLE_ARN_ERROR)
      return
    }
    setValidationError('')
    connect.mutate(roleArn, {
      // 프로젝트 상세의 연결 상태(진행 순서 표시)도 새로 받는다
      onSettled: () => void queryClient.invalidateQueries({ queryKey: projectQueries.all() }),
    })
  }

  const trustPolicy = connection?.trustPolicy ? formatTrustPolicy(connection.trustPolicy) : ''

  return (
    <>
      <PageTitle
        title="AWS 연결"
        sub="고객사 계정에 읽기 전용 Role을 만들면 비용과 사용량을 분석할 수 있어요"
      />

      <Field title="1. 고객사에 전달할 정보" wide>
        <p>고객사 담당자가 이 값으로 Role의 신뢰 정책을 만들어요</p>
        {connection && (
          <>
            <div className={styles.kv}>
              <span>우리 계정 ID</span>
              <b>{connection.accountId}</b>
              <CopyButton label="우리 계정 ID" value={connection.accountId} />
              <span>External ID</span>
              <b>{connection.externalId}</b>
              <CopyButton label="External ID" value={connection.externalId} />
            </div>
            {trustPolicy && (
              <>
                <div className={styles.policyHeader}>
                  <span>신뢰 정책 (Trust policy)</span>
                  <CopyButton label="신뢰 정책" value={trustPolicy} />
                </div>
                <pre>{trustPolicy}</pre>
              </>
            )}
          </>
        )}
        {!connection && connectionQuery.isPending && (
          <StateMessage>연결 정보를 불러오는 중…</StateMessage>
        )}
        {!connection && connectionQuery.isError && (
          <StateMessage error onRetry={() => void connectionQuery.refetch()}>
            {errorMessage(connectionQuery.error)}
          </StateMessage>
        )}
      </Field>

      <Field title="2. 고객사에서 받은 Role ARN 등록 · 연결 테스트" wide>
        <form onSubmit={handleSubmit} noValidate>
          <p>
            Role ARN을 등록하면 곧바로 Role을 맡아 읽기 권한까지 테스트해요. 이미 등록한 Role은 다시
            테스트만 해요
          </p>
          <input
            value={inputValue}
            placeholder="arn:aws:iam::123456789012:role/WaycoReadOnly"
            aria-label="Role ARN"
            aria-invalid={!!validationError}
            disabled={connect.isPending}
            onChange={handleChange}
          />
          {validationError && <p className={styles.fieldError}>{validationError}</p>}
          <button
            type="submit"
            className={styles.secondary}
            disabled={connect.isPending || roleArn === ''}
          >
            {connect.isPending
              ? '연결 테스트 중…'
              : isRegistered
                ? '연결 테스트'
                : '등록하고 연결 테스트'}
          </button>
        </form>
      </Field>

      <Field title="3. 연결 상태" wide>
        {connect.isError && <Notice tone="error">{errorMessage(connect.error)}</Notice>}
        {!connect.isError && guide && connection && (
          <Notice tone={guide.tone} title={guide.title}>
            {guide.message}
            {connection.roleArn && (
              <>
                <br />
                <span className={styles.mono}>{connection.roleArn}</span>
              </>
            )}
          </Notice>
        )}
        {!connection && !connectionQuery.isError && <p>연결 정보를 불러오면 상태가 보여요</p>}
      </Field>

      <StepFooter projectId={projectId} step="aws">
        <Link className={styles.footerButton} to={stepPath(projectId, 'analysis')}>
          인프라 분석으로
        </Link>
      </StepFooter>
    </>
  )
}
