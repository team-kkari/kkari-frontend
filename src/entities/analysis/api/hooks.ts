import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { jobQueries } from '@/shared/api'
import { analysisQueries } from './queries'
import { startAnalysis, uploadTerraform } from './requests'

/** 분석을 시작한다. 결과의 jobId 를 useAnalysisJob 에 넘기면 진행 상황을 볼 수 있다 */
export function useStartAnalysis(projectId: number) {
  return useMutation({ mutationFn: () => startAnalysis(projectId) })
}

/**
 * 분석 작업의 상태를 끝날 때까지 폴링한다 (jobId 가 없으면 요청하지 않는다).
 * 성공하면 분석 결과(discovery) 캐시를 무효화한다.
 */
export function useAnalysisJob(jobId: number | undefined) {
  const queryClient = useQueryClient()
  const query = useQuery({ ...jobQueries.detail(jobId ?? 0), enabled: jobId !== undefined })
  const succeeded = query.data?.status === 'SUCCEEDED'

  useEffect(() => {
    if (succeeded) void queryClient.invalidateQueries({ queryKey: analysisQueries.all() })
  }, [succeeded, queryClient])

  return query
}

/** Terraform state 파일을 올린다. 성공하면 분석 결과(discovery) 캐시를 무효화한다 */
export function useUploadTerraform(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadTerraform(projectId, file),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: analysisQueries.discovery(projectId).queryKey }),
  })
}
