import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { awsConnectionQueries } from './queries'
import { registerRoleArn, testAwsConnection } from './requests'

/** 연결 정보(External ID·신뢰 정책·현재 상태). enabled 가 false 면 요청하지 않는다 */
export function useAwsConnection(projectId: number, enabled = true) {
  return useQuery({ ...awsConnectionQueries.detail(projectId), enabled })
}

/**
 * Role ARN 을 등록하고 연결을 테스트한다. 결과 상태(CONNECTED 등)를 돌려준다.
 * 이미 같은 ARN 이 등록돼 있으면 등록은 건너뛰고 테스트만 다시 한다
 * (고객사가 신뢰 정책·권한을 고친 뒤 재시도하는 경우).
 * 응답은 연결 정보 캐시에 반영한다.
 */
export function useConnectAwsRole(projectId: number) {
  const queryClient = useQueryClient()
  const { queryKey } = awsConnectionQueries.detail(projectId)

  return useMutation({
    mutationFn: async (roleArn: string) => {
      if (queryClient.getQueryData(queryKey)?.roleArn !== roleArn) {
        queryClient.setQueryData(queryKey, await registerRoleArn(projectId, roleArn))
      }
      const tested = await testAwsConnection(projectId)
      queryClient.setQueryData(queryKey, tested)
      return tested
    },
  })
}
