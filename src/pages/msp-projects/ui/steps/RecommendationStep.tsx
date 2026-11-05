import { useEffect, useState } from 'react'
import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { Link } from 'react-router'
import { projectQueries, projectResultPath, type ProjectDetail } from '@/entities/project'
import {
  isArchitectureJobActive,
  isArchitectureNotFound,
  latestJobOf,
  recommendationQueries,
  useArchitectureGeneration,
  type GenerationPhase,
  type RecommendationResult,
} from '@/entities/recommendation'
import { formatDate } from '@/shared/lib'
import { spinnerSmallIcon } from '@/shared/ui'
import { cx } from '../../lib/cx'
import { stepPath } from '../../model/steps'
import { Field } from '../Field'
import styles from '../MspProjectsPage.module.css'
import { Notice } from '../Notice'
import { PageTitle } from '../PageTitle'
import { StateMessage } from '../StateMessage'
import { StepFooter } from '../StepFooter'

interface RecommendationStepProps {
  project: ProjectDetail
}

/** 서버가 받는 추천 개수 (1~5) */
const COUNT_OPTIONS = [1, 2, 3, 4, 5]
const DEFAULT_COUNT = 5

const TITLE = '추천 생성'
const SUB = '최근 분석 결과와 요구사항으로 AI가 추천 구조를 만들어요'

const BUSY_PHASES: GenerationPhase[] = ['starting', 'running', 'loading-result']

/**
 * 추천 생성: 최근 분석 결과와 요구사항으로 AI 추천 구조를 만든다(1~2.5분).
 * 이미 만든 추천이 있으면 결과 화면으로 가는 링크를 보여주고, 다시 생성할 수도 있다.
 * 생성 중에 화면을 나갔다 돌아와도 진행 중인 작업(latestJob)을 이어서 보여준다.
 */
export function RecommendationStep({ project }: RecommendationStepProps) {
  const { projectId } = project
  // 이전에 만든 결과와 진행 중인 작업이 있는지 먼저 확인한다 (결과가 없으면 AR002 오류)
  const existing = useQuery(recommendationQueries.exists(projectId))
  // 처음 확인이 끝난 뒤에는 이 조회가 다시 pending 이 돼도(재연결 등) 생성 화면을 지우지 않는다.
  // 하위 화면이 같은 조회를 또 구독하면 오류 상태에서 다시 불러오기를 되풀이하므로 값만 props 로 넘긴다
  const [checked, setChecked] = useState(false)
  if (!checked && !existing.isPending) setChecked(true)

  if (!checked) {
    return (
      <>
        <PageTitle title={TITLE} sub={SUB} />
        <StateMessage>추천 생성 상태를 확인하는 중…</StateMessage>
        <StepFooter projectId={projectId} step="recommendation" />
      </>
    )
  }

  const latestJob = latestJobOf(existing.data, existing.error)
  const resumeJobId = isArchitectureJobActive(latestJob) ? latestJob?.jobId : undefined
  return <RecommendationPanel project={project} existing={existing} resumeJobId={resumeJobId} />
}

interface RecommendationPanelProps extends RecommendationStepProps {
  /** 이전에 만든 추천 결과 조회 상태 */
  existing: Pick<UseQueryResult<RecommendationResult>, 'data' | 'error' | 'isError' | 'isSuccess'>
  /** 이미 대기·실행 중인 생성 작업. 있으면 새로 만들지 않고 이어서 보여준다 */
  resumeJobId: number | undefined
}

function RecommendationPanel({ project, existing, resumeJobId }: RecommendationPanelProps) {
  const { projectId } = project
  const queryClient = useQueryClient()
  const generation = useArchitectureGeneration(projectId, { resumeJobId })
  const latestJob = latestJobOf(existing.data, existing.error)
  const [count, setCount] = useState(DEFAULT_COUNT)

  const { phase, job, error, result } = generation
  const busy = BUSY_PHASES.includes(phase)
  const done = phase === 'done'
  // 분석이 끝나지 않았다면 서버가 409(AR001)로 거절한다. 미리 알려서 분석 단계로 안내한다
  const needsAnalysis = project.stage === 'RECEIVED'
  const resultLink = projectResultPath(projectId)

  // 새로 만들었으면 프로젝트 진행 단계(추천 완료)를 새로 받고, "이미 만든 결과"에도 이 결과를 넣는다
  useEffect(() => {
    if (!result) return
    void queryClient.invalidateQueries({ queryKey: projectQueries.all() })
    queryClient.setQueryData(recommendationQueries.exists(projectId).queryKey, result)
  }, [result, queryClient, projectId])

  const generate = () => {
    if (phase === 'failed') {
      // 작업은 끝났는데 결과 조회만 실패했거나, 이어서 보던 작업이 실패했으면 훅의 retry 를 쓴다
      // (앞은 다시 만들지 않고 결과만 다시 받고, 뒤는 새 작업으로 넘어간다. 새 작업은 기본 개수로 만든다)
      const resumedJobFailed = job !== undefined && job.jobId === resumeJobId
      if (job?.status === 'SUCCEEDED' || resumedJobFailed) {
        generation.retry()
        return
      }
    }
    generation.start(count)
  }

  const buttonLabel = busy
    ? '생성 중…'
    : phase === 'failed'
      ? '다시 시도'
      : !!existing.data || done
        ? '다시 생성'
        : '추천 생성'

  return (
    <>
      <PageTitle title={TITLE} sub={SUB} />

      {needsAnalysis && (
        <Notice title="인프라 분석을 먼저 마쳐 주세요">
          분석이 끝나야 추천을 만들 수 있어요.{' '}
          <Link className={styles.textLink} to={stepPath(projectId, 'analysis')}>
            인프라 분석으로 이동
          </Link>
        </Notice>
      )}

      <Field title="추천 구조 개수" wide>
        <p>1~5개까지 만들 수 있고, 1~2.5분 걸려요</p>
        <div className={styles.chips} role="group" aria-label="추천 구조 개수">
          {COUNT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={cx(styles.chip, count === option && styles.chipOn)}
              aria-pressed={count === option}
              disabled={busy}
              onClick={() => setCount(option)}
            >
              {option}개
            </button>
          ))}
        </div>
      </Field>

      <Field title="생성 상태" wide>
        {phase === 'idle' && existing.isError && (
          <p>
            {isArchitectureNotFound(existing.error)
              ? '아직 만든 추천이 없어요. 아래 버튼을 눌러 생성을 시작해 주세요'
              : '이전에 만든 추천이 있는지 확인하지 못했어요. 생성은 그대로 시작할 수 있어요'}
          </p>
        )}
        {phase === 'idle' && latestJob?.status === 'FAILED' && (
          <Notice tone="error" title="지난 생성이 실패했어요">
            {latestJob.failureReason ?? '추천 아키텍처를 만들지 못했어요.'}
          </Notice>
        )}
        {(phase === 'starting' || phase === 'running' || phase === 'loading-result') && (
          <p className={styles.busyLine} role="status">
            <img className={styles.spinner} src={spinnerSmallIcon} alt="" width={18} height={18} />
            {phase === 'starting'
              ? '생성을 요청하고 있어요…'
              : phase === 'loading-result'
                ? '결과를 불러오고 있어요…'
                : job?.status === 'RUNNING'
                  ? 'AI가 추천 구조를 만들고 있어요. 1~2.5분 걸려요'
                  : '생성을 기다리고 있어요…'}
          </p>
        )}
        {phase === 'failed' && (
          <Notice tone="error" title="추천을 만들지 못했어요">
            {error}
            {needsAnalysis && (
              <>
                {' '}
                <Link className={styles.textLink} to={stepPath(projectId, 'analysis')}>
                  인프라 분석으로 이동
                </Link>
              </>
            )}
          </Notice>
        )}
        {done && (
          <Notice tone="success" title="추천 구조를 만들었어요">
            {result
              ? `추천 ${result.recommendations.length}개가 준비됐어요.`
              : '결과가 준비됐어요.'}
          </Notice>
        )}
        {!done && existing.data && (
          <Notice title="이미 만든 추천이 있어요">
            {formatDate(existing.data.generatedAt)}에 만든 추천{' '}
            {existing.data.recommendations.length}
            개를 볼 수 있어요.
            {busy && ' 새로 만드는 동안에도 이전 결과를 볼 수 있어요.'}
          </Notice>
        )}
        {(done || existing.data) && (
          <Link className={cx(styles.secondary, styles.resultLink)} to={resultLink}>
            추천 결과 보기
          </Link>
        )}
      </Field>

      <StepFooter projectId={projectId} step="recommendation">
        <button type="button" className={styles.footerButton} disabled={busy} onClick={generate}>
          {buttonLabel}
        </button>
      </StepFooter>
    </>
  )
}
