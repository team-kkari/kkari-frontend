/**
 * AI 응답의 node.icon 키 → 아이콘 타일 표시 정보.
 * 색은 AWS 아키텍처 아이콘 카테고리 색을 따른다.
 * 공식 AWS 아이콘(shared/ui awsIcons)이 있으면 그걸 쓰고, 없을 때만 이 색 타일로 대체한다.
 */
import { awsIcons } from '@/shared/ui'

const CATEGORY_COLOR = {
  compute: '#ED7100',
  network: '#8C4FFF',
  storage: '#7AA116',
  database: '#C925D1',
  security: '#DD344C',
  management: '#E7157B',
  general: '#232F3E',
} as const

type Category = keyof typeof CATEGORY_COLOR

const ICONS: Record<string, { text: string; category: Category }> = {
  users: { text: 'USER', category: 'general' },
  internet: { text: 'WWW', category: 'general' },
  route53: { text: 'R53', category: 'network' },
  cloudfront: { text: 'CF', category: 'network' },
  api_gateway: { text: 'API', category: 'network' },
  vpc_endpoint: { text: 'VPCE', category: 'network' },
  igw: { text: 'IGW', category: 'network' },
  alb: { text: 'ALB', category: 'network' },
  nat_gateway: { text: 'NAT', category: 'network' },
  lambda: { text: 'λ', category: 'compute' },
  ec2: { text: 'EC2', category: 'compute' },
  auto_scaling: { text: 'ASG', category: 'compute' },
  ecs: { text: 'ECS', category: 'compute' },
  fargate: { text: 'FG', category: 'compute' },
  s3: { text: 'S3', category: 'storage' },
  efs: { text: 'EFS', category: 'storage' },
  aurora: { text: 'AUR', category: 'database' },
  rds: { text: 'RDS', category: 'database' },
  dynamodb: { text: 'DDB', category: 'database' },
  elasticache: { text: 'EC', category: 'database' },
  secrets_manager: { text: 'SM', category: 'security' },
  waf: { text: 'WAF', category: 'security' },
  cloudwatch: { text: 'CW', category: 'management' },
  eventbridge: { text: 'EB', category: 'management' },
}

export type ServiceIcon =
  { type: 'image'; src: string } | { type: 'tile'; text: string; color: string }

export function getServiceIcon(icon: string): ServiceIcon {
  const src = awsIcons[icon]
  if (src) return { type: 'image', src }
  const found = ICONS[icon]
  if (found) return { type: 'tile', text: found.text, color: CATEGORY_COLOR[found.category] }
  return { type: 'tile', text: icon.slice(0, 3).toUpperCase(), color: '#707E8F' }
}
