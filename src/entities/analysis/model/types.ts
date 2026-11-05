import type { JobStep } from '@/shared/api'

/** 백엔드 StartAnalysisResponse. 진행 상황은 jobId 로 작업 상태를 조회한다 */
export interface StartAnalysisResponse {
  jobId: number
}

/** 분석 단계 순서와 화면에 보여줄 이름 */
export const ANALYSIS_STEPS: { step: JobStep; label: string }[] = [
  { step: 'STRUCTURE', label: '리소스 구조 수집' },
  { step: 'USAGE', label: '14일 사용률 수집' },
  { step: 'COST', label: '월 예상 비용 계산' },
]

export interface Ec2Instance {
  instanceId: string
  instanceType: string
  platform?: string
  state: string
  availabilityZone: string
}

export interface EbsVolume {
  volumeId: string
  volumeType: string
  sizeGiB: number
}

export interface RdsInstance {
  dbInstanceId: string
  instanceClass: string
  engine: string
  multiAz: boolean
  allocatedStorageGiB: number
  status: string
}

export interface S3Bucket {
  name: string
  sizeBytes?: number
}

export interface LambdaFunction {
  functionName: string
  runtime: string
  memoryMb: number
}

export interface LoadBalancer {
  name: string
  type: string
}

export interface NatGateway {
  natGatewayId: string
  state: string
}

export interface Resources {
  ec2?: Ec2Instance[]
  ebs?: EbsVolume[]
  rds?: RdsInstance[]
  s3?: S3Bucket[]
  lambda?: LambdaFunction[]
  loadBalancers?: LoadBalancer[]
  natGateways?: NatGateway[]
}

/** 수집하지 못한 항목과 그 이유 */
export interface Missing {
  target: string
  reason: string
}

export interface MetricStats {
  average: number
  p95: number
  max: number
  datapoints: number
}

export interface Usage {
  days: number
  periodSeconds: number
  statistic: string
  /** 리소스 종류 → 리소스 ID → 지표 이름 → 통계 */
  byResource: Record<string, Record<string, Record<string, MetricStats>>>
}

export interface Cost {
  currency: string
  basis: string
  hoursPerMonth: number
  formulas: Record<string, string>
  /** 리소스 종류 → 리소스 ID → 월 예상 비용(USD) */
  monthlyUsdByResource: Record<string, Record<string, number>>
}

export interface InfraSnapshot {
  region: string
  collectedAt: string
  resources: Resources
  usage?: Usage
  cost?: Cost
  missing?: Missing[]
}

/** 업로드한 Terraform state 에서 읽은 리소스 구조. AWS 수집 결과와 같은 모양·ID 다 */
export interface TerraformInfra {
  resources: Resources
  missing?: Missing[]
  uploadedAt: string
}

/** 백엔드 DiscoveryResponse. 마지막으로 성공한 분석 결과 */
export interface DiscoveryResponse {
  jobId: number
  analyzedAt: string
  result: InfraSnapshot
  /** Terraform state 를 올리지 않았으면 비어 있다 */
  terraform?: TerraformInfra | null
}
