import { queryOptions } from '@tanstack/react-query'
import { delay } from '@/shared/lib'
import type { RecommendationResult } from '../model/types'
import type { RecommendationResponseDto } from './dto'
import { toRecommendationResult } from './mapper'
import sampleResponse from './mock/sample-response.json'

// TODO: 백엔드 연결 시 request<RecommendationResponseDto>(`/requests/${requestId}/recommendations`) 로 교체
//       의뢰 제목·우선순위는 의뢰 API 에서 받아오기
async function fetchRecommendationResult(requestId: string): Promise<RecommendationResult> {
  await delay(200)
  const dto = sampleResponse as RecommendationResponseDto
  return toRecommendationResult(dto, { requestId, title: 'A 쇼핑몰', priority: '비용 > 운영' })
}

export const recommendationQueries = {
  all: () => ['recommendations'] as const,
  result: (requestId: string) =>
    queryOptions({
      queryKey: [...recommendationQueries.all(), requestId],
      queryFn: () => fetchRecommendationResult(requestId),
    }),
}
