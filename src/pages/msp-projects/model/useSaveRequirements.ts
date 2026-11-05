import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveRequirements, type Requirements } from '@/entities/chat'
import { projectQueries } from '@/entities/project'
import { recommendationQueries } from '@/entities/recommendation'
import { requirementQueries } from '@/entities/requirement'

/**
 * 요구사항 전체를 저장한다(PUT, 교체). 성공하면 저장된 요구사항, 프로젝트 목록·상세(최근 수정 시각),
 * 추천 결과 화면의 우선순위 문구를 다시 불러오게 한다.
 */
export function useSaveRequirements(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: Requirements) => saveRequirements(projectId, body),
    onSuccess: () => {
      // 다시 불러오는 동안 기다리지 않는다 (저장 직후 다음 단계로 바로 넘어갈 수 있게)
      void queryClient.invalidateQueries({
        queryKey: requirementQueries.detail(projectId).queryKey,
      })
      void queryClient.invalidateQueries({ queryKey: projectQueries.all() })
      void queryClient.invalidateQueries({
        queryKey: recommendationQueries.priority(projectId).queryKey,
      })
    },
  })
}
