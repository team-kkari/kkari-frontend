import { queryOptions } from '@tanstack/react-query'
import { request } from './client'

/** 백엔드 AnalysisJobResponse. 인프라 분석(ANALYSIS)과 아키텍처 생성(ARCHITECTURE)이 같은 작업 모델을 쓴다 */
export type JobType = 'ANALYSIS' | 'ARCHITECTURE'
export type JobStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
export type JobStep = 'STRUCTURE' | 'USAGE' | 'COST'

export interface Job {
  jobId: number
  type: JobType
  status: JobStatus
  step?: JobStep
  failureReason?: string
  createdAt: string
  finishedAt?: string
}

export const isJobFinished = (job: Pick<Job, 'status'> | undefined) =>
  job?.status === 'SUCCEEDED' || job?.status === 'FAILED'

const POLL_INTERVAL_MS = 2_000

export const jobQueries = {
  all: () => ['jobs'] as const,
  /** 끝날 때(SUCCEEDED/FAILED)까지 2초마다 다시 조회한다 */
  detail: (jobId: number) =>
    queryOptions({
      queryKey: [...jobQueries.all(), jobId],
      queryFn: () => request<Job>(`/v1/jobs/${jobId}`),
      staleTime: 0,
      refetchInterval: (query) => (isJobFinished(query.state.data) ? false : POLL_INTERVAL_MS),
    }),
}
