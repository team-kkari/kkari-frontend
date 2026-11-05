import type { Recommendation, RecommendationResult } from '../model/types'
import type { ArchitectureDto, RecommendationResponseDto } from './dto'

function toRecommendation(dto: ArchitectureDto): Recommendation {
  return {
    id: `${dto.rank}-${dto.axis}`,
    rank: dto.rank,
    title: dto.axis_label,
    name: dto.name,
    bestFor: dto.best_for,
    easyExplanation: dto.easy_explanation,
    rankReason: dto.rank_reason,
    scores: dto.scores,
    pros: dto.pros,
    cons: dto.cons,
    migrationSteps: dto.migration_steps,
    cost: {
      monthlyTotalUsd: dto.cost.monthly_total_usd,
      items: dto.cost.items.map((item) => ({
        nodeId: item.node_id,
        label: item.label,
        monthlyUsd: item.monthly_usd,
        formula: item.formula,
      })),
      unpriced: dto.cost.unpriced,
      assumptions: dto.cost.assumptions,
    },
    vsCurrent: dto.vs_current,
    layout: {
      width: dto.layout.width,
      height: dto.layout.height,
      boxes: dto.layout.boxes,
      nodes: dto.layout.nodes.map(({ node_id, ...node }) => ({ ...node, nodeId: node_id })),
      edges: dto.layout.edges,
    },
  }
}

export function toRecommendationResult(
  dto: RecommendationResponseDto,
  meta: { requestId: string; title: string; priority: string },
): RecommendationResult {
  return {
    ...meta,
    summary: dto.overall,
    currentMonthlyUsd: dto.current.monthly_usd,
    recommendations: [...dto.architectures].sort((a, b) => a.rank - b.rank).map(toRecommendation),
  }
}
