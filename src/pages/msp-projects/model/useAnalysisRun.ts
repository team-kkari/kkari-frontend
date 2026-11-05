import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAnalysisJob, useStartAnalysis } from '@/entities/analysis'
import { projectQueries } from '@/entities/project'

export type AnalysisPhase = 'idle' | 'starting' | 'running' | 'succeeded' | 'failed'

/**
 * 인프라 분석 한 번의 실행: 시작(POST) → 작업 상태 폴링.
 * 성공하면 진행 단계(stage)와 월 비용이 바뀌므로 프로젝트 목록·상세를 다시 불러오게 한다.
 * 이미 대기·실행 중인 분석이 있으면 백엔드가 그 작업 ID 를 돌려주므로 start 를 다시 눌러도 안전하다.
 */
export function useAnalysisRun(projectId: number) {
  const queryClient = useQueryClient()
  const startMutation = useStartAnalysis(projectId)
  const jobId = startMutation.data?.jobId
  const jobQuery = useAnalysisJob(jobId)
  const job = jobQuery.data

  let phase: AnalysisPhase = 'idle'
  let error: unknown = null
  if (startMutation.isPending) {
    phase = 'starting'
  } else if (startMutation.isError) {
    phase = 'failed'
    error = startMutation.error
  } else if (jobId !== undefined) {
    if (job?.status === 'SUCCEEDED') phase = 'succeeded'
    else if (job?.status === 'FAILED') phase = 'failed'
    else if (jobQuery.isError && !job) {
      // 작업 상태를 못 읽었다. 작업 자체는 계속 돌고 있을 수 있어서 다시 불러오기를 안내한다
      phase = 'running'
      error = jobQuery.error
    } else phase = 'running'
  }

  const succeeded = phase === 'succeeded'
  useEffect(() => {
    if (succeeded) void queryClient.invalidateQueries({ queryKey: projectQueries.all() })
  }, [succeeded, queryClient])

  return {
    phase,
    job,
    /** 시작 요청이 실패했거나 작업 상태를 못 읽었을 때의 오류 */
    error,
    /** 작업 상태를 못 읽은 상태 (실패한 작업과 구분한다) */
    pollFailed: phase === 'running' && jobQuery.isError && !job,
    start: () => startMutation.mutate(),
    refetchJob: () => void jobQuery.refetch(),
  }
}
