export type ScoreKey = 'cost' | 'performance' | 'reliability' | 'operations' | 'migration'

/** 1~5점, 높을수록 좋음 */
export type Scores = Record<ScoreKey, number>

// ---------- 아키텍처 다이어그램 (AI 가 좌표까지 계산해 준 layout) ----------

/** cloud · edge_band · region_band · vpc · az · subnet · group */
export interface DiagramBox {
  id: string
  kind: string
  label: string
  x: number
  y: number
  w: number
  h: number
  /** subnet: public | private, group: auto_scaling | db_subnet_group */
  style: string
}

export interface DiagramNode {
  /** 화면상 id (같은 리소스가 AZ 마다 있으면 `lambda@AZ1` 처럼 나뉨) */
  id: string
  /** 비용 항목과 연결되는 리소스 id */
  nodeId: string
  icon: string
  label: string
  role: string
  x: number
  y: number
  w: number
  h: number
}

export interface DiagramEdge {
  source: string
  target: string
  label: string
}

export interface DiagramLayout {
  width: number
  height: number
  boxes: DiagramBox[]
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

// ---------- 비용 ----------

export interface CostItem {
  nodeId: string
  label: string
  /** null 이면 가격표에 없어 추정 불가 */
  monthlyUsd: number | null
  formula: string
}

export interface CostBreakdown {
  monthlyTotalUsd: number
  items: CostItem[]
  unpriced: string[]
  assumptions: string[]
}

// ---------- 추천 후보 ----------

export interface Recommendation {
  id: string
  rank: number
  /** 짧은 이름 (예: 서버리스 전환) */
  title: string
  /** 긴 이름 (예: Lambda + Aurora Serverless v2 ... 전환) */
  name: string
  bestFor: string
  easyExplanation: string
  rankReason: string
  scores: Scores
  pros: string[]
  cons: string[]
  migrationSteps: string[]
  cost: CostBreakdown
  vsCurrent: { usd: number; pct: number }
  layout: DiagramLayout
}

/** 한 의뢰에 대한 추천 결과 전체 */
export interface RecommendationResult {
  requestId: string
  title: string
  priority: string
  summary: string
  currentMonthlyUsd: number
  recommendations: Recommendation[]
}

export const SCORE_LABEL: Record<ScoreKey, string> = {
  cost: '비용',
  performance: '성능',
  reliability: '안정성',
  operations: '운영',
  migration: '전환',
}

/** 표·레이더 차트에 쓰는 축 순서 (레이더는 위에서 시계 방향) */
export const SCORE_KEYS: ScoreKey[] = [
  'cost',
  'performance',
  'reliability',
  'operations',
  'migration',
]

export const MAX_SCORE = 5
