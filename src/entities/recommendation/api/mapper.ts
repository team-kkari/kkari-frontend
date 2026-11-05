import { ApiError } from '@/shared/api'
import type { Recommendation, RecommendationResult, Scores } from '../model/types'
import type { ArchitectureDto, ArchitectureResponseDto, RecommendationResponseDto } from './dto'

/** AI 순위 생성에 실패해 점수가 없을 때 쓰는 값 */
const NO_SCORES: Scores = { cost: 0, performance: 0, reliability: 0, operations: 0, migration: 0 }

/** AI 순위 생성에 실패해 이유가 비었을 때 보여 줄 문장 (AI 서버가 월 비용 낮은 순으로 정렬한다) */
const NO_RANK_REASON = 'AI 순위를 매기지 못해 월 비용이 낮은 순으로 정렬했어요.'

function isResponseDto(value: unknown): value is RecommendationResponseDto {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { architectures?: unknown }).architectures)
  )
}

function toRecommendation(dto: ArchitectureDto, currentMonthlyUsd: number | null): Recommendation {
  const cost = dto.cost
  const layout = dto.layout
  return {
    id: `${dto.rank}-${dto.axis}`,
    rank: dto.rank,
    title: dto.axis_label,
    name: dto.name,
    bestFor: dto.best_for || dto.concept || '',
    easyExplanation: dto.easy_explanation ?? '',
    rankReason: dto.rank_reason || NO_RANK_REASON,
    scores: dto.scores ?? NO_SCORES,
    pros: dto.pros ?? [],
    cons: dto.cons ?? [],
    migrationSteps: dto.migration_steps ?? [],
    cost: {
      monthlyTotalUsd: cost?.monthly_total_usd ?? 0,
      items: (cost?.items ?? []).map((item) => ({
        nodeId: item.node_id,
        label: item.label,
        monthlyUsd: item.monthly_usd ?? null,
        formula: item.formula ?? '',
      })),
      unpriced: cost?.unpriced ?? [],
      assumptions: cost?.assumptions ?? [],
    },
    vsCurrent: dto.vs_current ?? { usd: 0, pct: 0 },
    comparable: dto.vs_current != null && currentMonthlyUsd !== null,
    layout: {
      width: layout?.width ?? 0,
      height: layout?.height ?? 0,
      boxes: layout?.boxes ?? [],
      nodes: (layout?.nodes ?? []).map(({ node_id, ...node }) => ({ ...node, nodeId: node_id })),
      edges: layout?.edges ?? [],
    },
  }
}

/**
 * 백엔드 응답을 화면용 타입으로 바꾼다.
 * result 가 AI 서버 응답 그대로라 모양이 틀어질 수 있어, 핵심(architectures 배열)만 확인하고 나머지는 빈 값으로 채운다.
 */
export function toRecommendationResult(
  response: ArchitectureResponseDto,
  projectId: number,
): RecommendationResult {
  const dto = response.result
  if (!isResponseDto(dto)) {
    throw new ApiError(502, 'INVALID_ARCHITECTURE_RESULT', '추천 결과의 형식을 읽지 못했어요.')
  }

  const currentMonthlyUsd =
    typeof dto.current?.monthly_usd === 'number' ? dto.current.monthly_usd : null

  return {
    projectId,
    jobId: response.jobId,
    generatedAt: response.generatedAt,
    summary: dto.overall ?? '',
    currentMonthlyUsd,
    recommendations: [...dto.architectures]
      .sort((a, b) => a.rank - b.rank)
      .map((architecture) => toRecommendation(architecture, currentMonthlyUsd)),
  }
}
