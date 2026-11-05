import { queryOptions } from '@tanstack/react-query'
import { ApiError, request } from '@/shared/api'
import type { LatestArchitectureJob, RecommendationResult } from '../model/types'
import { toRecommendationResult } from './mapper'
import { ArchitectureNotFoundError, requestArchitectures } from './request'

/** 백엔드 Priority enum → 화면 표시 */
const PRIORITY_LABEL: Record<string, string> = {
  COST: '비용',
  PERFORMANCE: '성능',
  RELIABILITY: '안정성',
  SECURITY: '보안',
}

/** 아직 생성된 추천 아키텍처가 없을 때 백엔드가 주는 오류 (404, AR002) */
export const isArchitectureNotFound = (error: unknown) =>
  error instanceof ApiError && error.code === 'AR002'

/** 설계 작업이 대기·실행 중인지 */
export const isArchitectureJobActive = (job: LatestArchitectureJob | null | undefined) =>
  job?.status === 'QUEUED' || job?.status === 'RUNNING'

/**
 * 추천 결과 조회의 가장 최근 설계 작업. 결과가 있으면 응답의 latestJob, 아직 없으면(AR002) 오류에 담긴 latestJob.
 * 새 필드가 없는 옛 서버이거나 설계를 시작한 적이 없으면 null
 */
export function latestJobOf(
  data: RecommendationResult | undefined,
  error: unknown,
): LatestArchitectureJob | null {
  if (error instanceof ArchitectureNotFoundError) return error.latestJob
  return data?.latestJob ?? null
}

const fetchResult = async (path: string, id: number) =>
  toRecommendationResult(await requestArchitectures(path), id)

/** 4xx(생성 전, 권한 없음 등)는 다시 해도 같다 */
const retryServerError = (failureCount: number, error: Error) =>
  !(error instanceof ApiError && error.status < 500) && failureCount < 1

export const recommendationQueries = {
  all: () => ['recommendations'] as const,
  /**
   * 이미 만든 추천 결과가 있는지만 본다 (없으면 AR002 로 실패). 생성 훅의 result 와 키를 나눠서,
   * 설계가 끝나는 순간 이 쿼리의 상태가 화면 전환을 일으키지 않게 한다.
   */
  exists: (projectId: number) =>
    queryOptions({
      queryKey: [...recommendationQueries.all(), 'exists', projectId],
      queryFn: () => fetchResult(`/v1/projects/${projectId}/architectures`, projectId),
      enabled: Number.isInteger(projectId),
      retry: false,
      // 진행 중인 설계 작업(latestJob)으로 상담 화면을 열기 때문에, 다시 열 때 낡은 값을 쓰지 않게 캐시를 남기지 않는다
      gcTime: 0,
    }),
  /** 마지막으로 성공한 추천 아키텍처. 생성 전이면 AR002 오류 */
  result: (projectId: number) =>
    queryOptions({
      queryKey: [...recommendationQueries.all(), 'result', projectId],
      queryFn: () => fetchResult(`/v1/projects/${projectId}/architectures`, projectId),
      // 주소의 숫자가 아닌 값(NaN)으로는 호출하지 않는다
      enabled: Number.isInteger(projectId),
      retry: retryServerError,
    }),
  /** 고객이 보는 내 서비스의 추천 결과. 서비스는 백엔드에서 프로젝트와 같은 id 를 쓴다. 생성 전이면 AR002 오류 */
  customerResult: (serviceId: number) =>
    queryOptions({
      queryKey: [...recommendationQueries.all(), 'customer-result', serviceId],
      queryFn: () => fetchResult(`/v1/customer/services/${serviceId}/architectures`, serviceId),
      enabled: Number.isInteger(serviceId),
      retry: retryServerError,
    }),
  /**
   * 의뢰의 우선순위를 "비용 > 성능" 처럼 이은 문자열. 요구사항을 아직 입력하지 않았으면 빈 문자열.
   * 프로젝트 상세(ProjectDetailResponse)에는 우선순위가 없어 요구사항 API 에서 가져온다
   */
  priority: (projectId: number) =>
    queryOptions({
      queryKey: [...recommendationQueries.all(), 'priority', projectId],
      queryFn: async () => {
        try {
          const requirements = await request<{ priorities?: string[] | null }>(
            `/v1/projects/${projectId}/requirements`,
          )
          return (requirements.priorities ?? [])
            .map((priority) => PRIORITY_LABEL[priority] ?? priority)
            .join(' > ')
        } catch (error) {
          // 요구사항을 아직 입력하지 않으면 404(R001)
          if (error instanceof ApiError && error.status === 404) return ''
          throw error
        }
      },
      enabled: Number.isInteger(projectId),
    }),
}
