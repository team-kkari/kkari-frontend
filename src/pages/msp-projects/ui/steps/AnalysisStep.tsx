import { Link } from 'react-router'
import { AnalysisProgress } from '@/entities/analysis'
import type { ProjectDetail } from '@/entities/project'
import { errorMessage, hasErrorCode } from '../../lib/error-message'
import { stepPath } from '../../model/steps'
import { useAnalysisRun } from '../../model/useAnalysisRun'
import { Field } from '../Field'
import styles from '../MspProjectsPage.module.css'
import { Notice } from '../Notice'
import { PageTitle } from '../PageTitle'
import { StepFooter } from '../StepFooter'
import { AnalysisResult } from './AnalysisResult'
import { TerraformUpload } from './TerraformUpload'

interface AnalysisStepProps {
  project: ProjectDetail
}

/** 인프라 분석: 고객사 AWS의 구조·14일 사용률·월 예상 비용을 모으고, Terraform state 를 선택으로 더한다 */
export function AnalysisStep({ project }: AnalysisStepProps) {
  const { projectId } = project
  const run = useAnalysisRun(projectId)
  const connected = project.awsConnectionStatus === 'CONNECTED'
  const busy = run.phase === 'starting' || run.phase === 'running'
  // 시작 요청 자체가 실패했으면 보여줄 작업 진행이 없다
  const showProgress = run.phase !== 'idle' && !(run.phase === 'failed' && !run.job)
  const awsLink = (
    <Link className={styles.textLink} to={stepPath(projectId, 'aws')}>
      AWS 연결로 이동
    </Link>
  )

  return (
    <>
      <PageTitle
        title="인프라 분석"
        sub="최근 14일 사용률과 온디맨드 정가 기준 추정 비용을 모아요"
      />

      <Field title="분석 실행" wide>
        <p>
          고객사 AWS의 리소스 구조, 14일 사용률, 월 예상 비용을 모아요. 몇 분 걸릴 수 있고, 분석
          중에 화면을 나갔다면 다시 눌러도 진행 중이던 분석에 이어져요
        </p>
        {!connected && run.phase === 'idle' && (
          <Notice title="AWS 연결을 먼저 마쳐 주세요">
            연결 테스트에 성공(연결됨)해야 분석을 시작할 수 있어요. {awsLink}
          </Notice>
        )}
        {showProgress && (
          <div className={styles.progressBox}>
            <AnalysisProgress job={run.job} />
          </div>
        )}
        {run.phase === 'failed' && (
          <Notice tone="error" title="분석에 실패했어요">
            {hasErrorCode(run.error, 'AN001') ? (
              <>AWS 연결 테스트에 성공한 프로젝트만 분석할 수 있어요. {awsLink}</>
            ) : (
              (run.job?.failureReason ?? errorMessage(run.error))
            )}
          </Notice>
        )}
        {run.pollFailed && (
          <Notice tone="error" title="진행 상황을 불러오지 못했어요">
            {errorMessage(run.error)}{' '}
            <button type="button" className={styles.retryButton} onClick={run.refetchJob}>
              진행 상황 다시 불러오기
            </button>
          </Notice>
        )}
        <button type="button" className={styles.secondary} disabled={busy} onClick={run.start}>
          {run.phase === 'starting'
            ? '분석을 요청하는 중…'
            : run.phase === 'running'
              ? '분석 중…'
              : run.phase === 'idle' && project.stage === 'RECEIVED'
                ? '분석 시작'
                : '다시 분석'}
        </button>
      </Field>

      <AnalysisResult projectId={projectId} />

      <TerraformUpload project={project} />

      <StepFooter projectId={projectId} step="analysis">
        <Link className={styles.footerButton} to={stepPath(projectId, 'recommendation')}>
          추천 생성으로
        </Link>
      </StepFooter>
    </>
  )
}
