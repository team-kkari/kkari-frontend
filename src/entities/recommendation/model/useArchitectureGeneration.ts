import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { ApiError, jobQueries, requestJson } from '@/shared/api'
import { recommendationQueries } from '../api/queries'
import type { RecommendationResult } from './types'

/** 백엔드 기본값과 같다 (1~5) */
const DEFAULT_COUNT = 5

/**
 * 생성 진행 단계
 * - idle: 아직 시작 전
 * - starting: 생성 요청을 보내는 중
 * - running: 작업이 대기·실행 중 (보통 1~2.5분)
 * - loading-result: 작업은 끝났고 결과를 받아오는 중
 * - done: 결과가 준비됨
 * - failed: 시작·작업·결과 조회 중 하나가 실패함
 */
export type GenerationPhase = 'idle' | 'starting' | 'running' | 'loading-result' | 'done' | 'failed'

function toMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : '서버에 연결하지 못했어요.'
}

/**
 * 추천 아키텍처 생성: 시작(POST) → 작업 상태 폴링(jobQueries.detail) → 결과 조회(GET).
 * 이미 대기·실행 중인 생성 작업이 있으면 백엔드가 그 작업 ID 를 돌려주므로 start 를 다시 불러도 안전하다.
 */
export function useArchitectureGeneration(projectId: number) {
  const startMutation = useMutation({
    mutationFn: (count: number) =>
      requestJson<{ jobId: number }>(`/v1/projects/${projectId}/architectures`, 'POST', { count }),
  })
  const { mutate, reset } = startMutation

  const jobId = startMutation.data?.jobId
  const job = useQuery({ ...jobQueries.detail(jobId ?? 0), enabled: jobId !== undefined })
  const succeeded = job.data?.status === 'SUCCEEDED'

  // 이전 생성 때 캐시된 결과가 남아 있을 수 있어 작업이 끝날 때마다 새로 받는다
  const result = useQuery({
    ...recommendationQueries.result(projectId),
    enabled: succeeded,
    staleTime: 0,
  })

  let phase: GenerationPhase
  let error: string | null = null
  if (startMutation.isError) {
    phase = 'failed'
    error = toMessage(startMutation.error)
  } else if (jobId === undefined) {
    phase = startMutation.isPending ? 'starting' : 'idle'
  } else if (job.data?.status === 'FAILED') {
    phase = 'failed'
    error = job.data.failureReason ?? '추천 아키텍처를 만들지 못했어요.'
  } else if (job.isError && !job.data) {
    phase = 'failed'
    error = toMessage(job.error)
  } else if (!succeeded) {
    phase = 'running'
  } else if (result.isError) {
    phase = 'failed'
    error = toMessage(result.error)
  } else if (result.isSuccess && !result.isFetching) {
    phase = 'done'
  } else {
    phase = 'loading-result'
  }

  const { refetch: refetchResult } = result
  const start = useCallback((count: number = DEFAULT_COUNT) => mutate(count), [mutate])

  /** 실패한 단계부터 다시 한다. 결과 조회만 실패했다면 생성은 다시 하지 않는다 */
  const retry = useCallback(() => {
    if (succeeded) {
      void refetchResult()
      return
    }
    reset()
    mutate(DEFAULT_COUNT)
  }, [succeeded, refetchResult, reset, mutate])

  const data: RecommendationResult | undefined = phase === 'done' ? result.data : undefined

  return { phase, error, start, retry, job: job.data, result: data }
}
