/** AI 추천 API 응답 원본 (snake_case). 화면에서는 mapper 를 거친 도메인 타입을 쓴다 */

export interface ScoresDto {
  cost: number
  performance: number
  reliability: number
  operations: number
  migration: number
}

export interface LayoutBoxDto {
  id: string
  kind: string
  label: string
  x: number
  y: number
  w: number
  h: number
  style: string
}

export interface LayoutNodeDto {
  id: string
  node_id: string
  icon: string
  label: string
  role: string
  x: number
  y: number
  w: number
  h: number
}

export interface LayoutEdgeDto {
  source: string
  target: string
  label: string
}

export interface LayoutDto {
  width: number
  height: number
  boxes: LayoutBoxDto[]
  nodes: LayoutNodeDto[]
  edges: LayoutEdgeDto[]
  warnings: string[]
}

export interface CostItemDto {
  node_id: string
  label: string
  kind: string
  monthly_usd: number | null
  formula: string
}

export interface ArchitectureDto {
  rank: number
  axis: string
  axis_label: string
  name: string
  signature_changes: string[]
  rank_reason: string
  best_for: string
  concept: string
  easy_explanation: string
  scores: ScoresDto
  pros: string[]
  cons: string[]
  migration_steps: string[]
  cost: {
    monthly_total_usd: number
    items: CostItemDto[]
    unpriced: string[]
    assumptions: string[]
  }
  vs_current: { usd: number; pct: number }
  layout: LayoutDto
}

export interface RecommendationResponseDto {
  overall: string
  current: { monthly_usd: number }
  architectures: ArchitectureDto[]
}
