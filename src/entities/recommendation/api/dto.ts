/**
 * 추천 아키텍처 응답 원본.
 *
 * 백엔드 `GET /v1/projects/{projectId}/architectures` 는 `{ jobId, generatedAt, result }` 를 돌려주고,
 * `result` 는 AI 서버 `POST /architectures` 응답 JSON 을 가공 없이 그대로 담는다 (snake_case).
 * 아래 모양은 AI 서버 소스(architect.py 의 `Architect.run`, schemas.py)를 따른다.
 * 화면에서는 mapper 를 거친 도메인 타입을 쓴다.
 */

/** 백엔드 ArchitectureResponse. result 는 JsonNode(자유 JSON)라 모양을 mapper 에서 확인한다 */
export interface ArchitectureResponseDto {
  jobId: number
  generatedAt: string
  result: unknown
}

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
  /** AI 순위 생성에 실패하면 빈 문자열 */
  rank_reason: string
  /** AI 순위 생성에 실패하면 빈 문자열 */
  best_for: string
  concept: string
  easy_explanation: string
  /** AI 순위 생성에 실패하면 null */
  scores: ScoresDto | null
  pros: string[]
  cons: string[]
  migration_steps: string[]
  cost: {
    monthly_total_usd: number
    items: CostItemDto[]
    unpriced: string[]
    assumptions: string[]
  }
  /** 현재 월 비용을 모르거나 이 안의 비용을 하나도 계산하지 못하면 null */
  vs_current: { usd: number; pct: number } | null
  layout: LayoutDto
}

export interface RecommendationResponseDto {
  /** AI 순위 생성에 실패하면 빈 문자열 */
  overall: string
  /** 백엔드는 현재 비용을 넘기지 않아 AI 추정값(source: 'estimated')이고, 추정도 못 하면 null */
  current: { monthly_usd: number | null; source?: 'input' | 'estimated' | null }
  architectures: ArchitectureDto[]
  warnings?: string[]
}
