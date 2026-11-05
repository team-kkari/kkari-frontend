import type { InfraSnapshot, Resources } from '@/entities/analysis'
import { formatBytes, formatPercent, formatUsd } from '../lib/format'

export interface ResourceRow {
  key: string
  name: string
  spec: string
  /** 14일 평균 / p95 */
  usage: string
  cost: string
}

export interface AnalysisSummary {
  /** 월 예상 비용 합(USD). 비용 정보가 없으면 null */
  totalCost: number | null
  /** 일부 리소스의 구조·비용을 수집하지 못해 합계가 실제보다 작을 수 있다 */
  costIsPartial: boolean
  ec2Count: number
  rdsCount: number
  /** EC2 인스턴스들의 14일 평균 CPU(%)의 평균 */
  avgCpu: number | null
  rows: ResourceRow[]
}

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

const average = (values: number[]) => (values.length > 0 ? sum(values) / values.length : null)

/** 비용 키(EC2, RDS ...)와 리소스 ID 로 월 비용을 모은다. 하나도 없으면 undefined */
function costOf(snapshot: InfraSnapshot, kind: string, ids: string[]): number | undefined {
  const byId = snapshot.cost?.monthlyUsdByResource?.[kind]
  const values = ids.map((id) => byId?.[id]).filter(isNumber)
  return values.length > 0 ? sum(values) : undefined
}

/** 한 리소스 종류의 CPU 사용률(평균, p95) 목록 */
function cpuOf(snapshot: InfraSnapshot, kind: string, ids: string[]) {
  const averages: number[] = []
  const p95s: number[] = []
  for (const id of ids) {
    const stats = snapshot.usage?.byResource?.[kind]?.[id]?.CPUUtilization
    if (isNumber(stats?.average)) averages.push(stats.average)
    if (isNumber(stats?.p95)) p95s.push(stats.p95)
  }
  return { averages, p95s }
}

/** 여러 리소스는 평균의 평균 / p95 의 최댓값으로 묶어 보여준다 */
function usageText(snapshot: InfraSnapshot, kind: string, ids: string[]) {
  const { averages, p95s } = cpuOf(snapshot, kind, ids)
  if (averages.length === 0) return '-'
  return `CPU ${formatPercent(average(averages))} / ${formatPercent(p95s.length > 0 ? Math.max(...p95s) : null)}`
}

const unique = (values: (string | null | undefined)[]) => [
  ...new Set(values.filter((value): value is string => !!value)),
]

function buildRows(snapshot: InfraSnapshot): ResourceRow[] {
  const { ec2, ebs, rds, s3, lambda, loadBalancers, natGateways }: Resources =
    snapshot.resources ?? {}
  const rows: ResourceRow[] = []

  // EC2 는 인스턴스 타입별로 묶는다
  const ec2ByType = new Map<string, string[]>()
  for (const instance of ec2 ?? []) {
    ec2ByType.set(instance.instanceType, [
      ...(ec2ByType.get(instance.instanceType) ?? []),
      instance.instanceId,
    ])
  }
  for (const [type, ids] of ec2ByType) {
    rows.push({
      key: `ec2-${type}`,
      name: `EC2 ${ids.length}대`,
      spec: type,
      usage: usageText(snapshot, 'EC2', ids),
      cost: formatUsd(costOf(snapshot, 'EC2', ids)),
    })
  }

  for (const db of rds ?? []) {
    const availability =
      typeof db.multiAz === 'boolean' ? (db.multiAz ? 'Multi-AZ' : 'Single-AZ') : ''
    rows.push({
      key: `rds-${db.dbInstanceId}`,
      name: `RDS ${db.dbInstanceId}`,
      spec: [db.instanceClass, availability].filter(Boolean).join(', ') || '-',
      usage: usageText(snapshot, 'RDS', [db.dbInstanceId]),
      cost: formatUsd(costOf(snapshot, 'RDS', [db.dbInstanceId])),
    })
  }

  if (ebs && ebs.length > 0) {
    const totalGiB = sum(ebs.map((volume) => volume.sizeGiB).filter(isNumber))
    rows.push({
      key: 'ebs',
      name: `EBS 볼륨 ${ebs.length}개`,
      spec: `${unique(ebs.map((volume) => volume.volumeType)).join(', ')} ${totalGiB}GiB`.trim(),
      usage: '-',
      cost: formatUsd(
        costOf(
          snapshot,
          'EBS',
          ebs.map((volume) => volume.volumeId),
        ),
      ),
    })
  }

  if (s3 && s3.length > 0) {
    const sizes = s3.map((bucket) => bucket.sizeBytes).filter(isNumber)
    rows.push({
      key: 's3',
      name: `S3 버킷 ${s3.length}개`,
      spec: sizes.length > 0 ? `약 ${formatBytes(sum(sizes))}` : '-',
      usage: '-',
      cost: formatUsd(
        costOf(
          snapshot,
          'S3',
          s3.map((bucket) => bucket.name),
        ),
      ),
    })
  }

  if (lambda && lambda.length > 0) {
    rows.push({
      key: 'lambda',
      name: `Lambda 함수 ${lambda.length}개`,
      spec: unique(lambda.map((fn) => fn.runtime)).join(', ') || '-',
      usage: '-',
      cost: formatUsd(
        costOf(
          snapshot,
          'LAMBDA',
          lambda.map((fn) => fn.functionName),
        ),
      ),
    })
  }

  if (loadBalancers && loadBalancers.length > 0) {
    rows.push({
      key: 'elb',
      name: `로드 밸런서 ${loadBalancers.length}개`,
      spec: unique(loadBalancers.map((balancer) => balancer.type)).join(', ') || '-',
      usage: '-',
      cost: formatUsd(
        costOf(
          snapshot,
          'ELB',
          loadBalancers.map((balancer) => balancer.name),
        ),
      ),
    })
  }

  if (natGateways && natGateways.length > 0) {
    rows.push({
      key: 'nat',
      name: `NAT Gateway ${natGateways.length}개`,
      spec: '-',
      usage: '-',
      cost: formatUsd(
        costOf(
          snapshot,
          'NAT',
          natGateways.map((gateway) => gateway.natGatewayId),
        ),
      ),
    })
  }

  return rows
}

/** 분석 결과(수집 스냅샷)를 화면에 보여줄 요약과 리소스 표로 바꾼다 */
export function summarizeSnapshot(snapshot: InfraSnapshot): AnalysisSummary {
  const costGroups = Object.values(snapshot.cost?.monthlyUsdByResource ?? {})
  const costs = costGroups.flatMap((group) => Object.values(group ?? {})).filter(isNumber)
  const resources: Resources = snapshot.resources ?? {}
  const ec2Ids = (resources.ec2 ?? []).map((instance) => instance.instanceId)

  return {
    totalCost: snapshot.cost ? sum(costs) : null,
    costIsPartial: (snapshot.missing ?? []).some(({ target }) =>
      /^(COST|STRUCTURE)\b/.test(target),
    ),
    ec2Count: ec2Ids.length,
    rdsCount: resources.rds?.length ?? 0,
    avgCpu: average(cpuOf(snapshot, 'EC2', ec2Ids).averages),
    rows: buildRows(snapshot),
  }
}

/** Terraform state 에서 읽은 리소스 수 */
export function countResources(resources: Resources): number {
  return Object.values(resources).reduce(
    (total, list) => total + (Array.isArray(list) ? list.length : 0),
    0,
  )
}
