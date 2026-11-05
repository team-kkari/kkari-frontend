export interface GlossaryTerm {
  /** 화면에 보이는 대표 표기 */
  term: string
  /** 문장에서 같은 뜻으로 찾을 다른 표기 (대소문자 구분) */
  aliases?: string[]
  /** 툴팁 제목 (없으면 term) */
  title?: string
  /** 비전공자도 이해할 수 있는 한두 문장 설명 */
  description: string
  /** 다이어그램 node.icon 키와 연결 (노드 카드에서 설명을 보여줄 때) */
  icons?: string[]
}

/**
 * 비전공자용 클라우드 용어 사전.
 * 긴 표기가 먼저 매칭되므로 'Multi-AZ' 와 'AZ' 처럼 겹쳐도 괜찮다.
 */
export const GLOSSARY: GlossaryTerm[] = [
  // ---------- 서버·컴퓨팅 ----------
  {
    term: 'EC2',
    aliases: ['Amazon EC2'],
    title: 'EC2 (Elastic Compute Cloud)',
    description: 'AWS에서 빌려 쓰는 가상 서버예요. 켜져 있는 시간만큼 요금이 나가요.',
    icons: ['ec2'],
  },
  {
    term: 'Lambda',
    aliases: ['AWS Lambda'],
    title: 'AWS Lambda',
    description:
      '서버를 직접 켜 두지 않고, 요청이 올 때만 코드를 실행해 주는 서비스예요. 실행된 만큼만 돈을 내요.',
    icons: ['lambda'],
  },
  {
    term: 'Auto Scaling',
    aliases: ['EC2 Auto Scaling', 'ASG', 'Auto Scaling 그룹'],
    title: 'Auto Scaling',
    description: '사용량에 맞춰 서버 대수를 자동으로 늘리거나 줄여 주는 기능이에요.',
    icons: ['auto_scaling'],
  },
  {
    term: 'Graviton',
    description: 'AWS가 직접 만든 ARM 기반 CPU예요. 같은 성능에 더 싸고 전기도 적게 써요.',
  },
  {
    term: 'ARM64',
    aliases: ['ARM'],
    title: 'ARM / ARM64',
    description:
      '스마트폰에도 쓰이는 CPU 설계 방식이에요. 일반 PC용(x86)과 달라서 프로그램이 잘 도는지 미리 확인해야 해요.',
  },
  {
    term: 'x86',
    description:
      '일반 PC와 대부분의 서버에 쓰이는 CPU 방식이에요. 지금 쓰는 프로그램은 보통 이걸 기준으로 만들어져요.',
  },
  {
    term: 'OS',
    title: 'OS (운영체제)',
    description:
      '서버를 움직이는 기본 소프트웨어(리눅스, 윈도우 등)예요. "OS 패치"는 보안 문제를 막으려고 이걸 주기적으로 업데이트하는 일이에요.',
  },
  {
    term: 'AMI',
    title: 'AMI (Amazon Machine Image)',
    description:
      '서버를 만들 때 쓰는 설치 이미지(틀)예요. OS와 프로그램이 미리 깔린 상태를 저장해 둬요.',
  },
  {
    term: 'Launch Template',
    description: '서버를 새로 만들 때 어떤 사양·이미지로 만들지 적어 둔 설정서예요.',
  },
  {
    term: 'vCPU',
    description: '가상 서버에 배정된 CPU 개수예요. 숫자가 클수록 동시에 더 많은 일을 처리해요.',
  },
  {
    term: 'GiB',
    description: '메모리·저장 용량 단위예요. 1GiB는 약 1.07GB로, GB와 거의 같다고 보면 돼요.',
  },
  {
    term: 'CPU',
    description:
      '서버의 두뇌 역할을 하는 연산 장치예요. "CPU 평균 8%"는 성능의 8%만 쓰고 있다는 뜻이에요.',
  },
  {
    term: 'ECS',
    aliases: ['Amazon ECS'],
    title: 'ECS (Elastic Container Service)',
    description: '앱을 "컨테이너"라는 표준 상자에 담아 여러 대에서 돌려 주는 서비스예요.',
    icons: ['ecs'],
  },
  {
    term: 'Fargate',
    aliases: ['AWS Fargate'],
    description: '서버를 직접 관리하지 않고 컨테이너만 맡기면 알아서 실행해 주는 방식이에요.',
    icons: ['fargate'],
  },
  {
    term: '콜드 스타트',
    description:
      '한동안 쉬던 서비스가 첫 요청을 받을 때 깨어나느라 응답이 잠깐 느려지는 현상이에요.',
  },
  {
    term: '무상태',
    description:
      '서버가 사용자 정보를 기억하지 않는 구조예요. 그래야 서버를 마음대로 늘리고 줄여도 문제가 없어요.',
  },
  {
    term: '리팩터링',
    description: '기능은 그대로 두고 코드 구조를 고치는 작업이에요. 개발자 시간이 들어요.',
  },

  // ---------- 네트워크 ----------
  {
    term: 'ALB',
    aliases: ['Application Load Balancer'],
    title: 'ALB (Application Load Balancer)',
    description:
      '들어오는 요청을 여러 서버에 골고루 나눠 주는 "교통 정리" 장치예요. 서버 한 대가 고장 나도 다른 서버로 보내 줘요.',
    icons: ['alb', 'elb'],
  },
  {
    term: 'Route 53',
    aliases: ['Amazon Route 53'],
    title: 'Amazon Route 53',
    description:
      '도메인 주소(example.com)를 실제 서버 위치로 연결해 주는 AWS의 전화번호부(DNS)예요.',
    icons: ['route53'],
  },
  {
    term: 'CloudFront',
    aliases: ['Amazon CloudFront'],
    title: 'Amazon CloudFront',
    description:
      '이미지·화면 파일을 사용자와 가까운 곳에 복사해 두고 빠르게 보내 주는 서비스(CDN)예요.',
    icons: ['cloudfront'],
  },
  {
    term: 'API Gateway',
    aliases: ['Amazon API Gateway'],
    title: 'Amazon API Gateway',
    description:
      '앱으로 들어오는 요청을 받아 알맞은 기능(Lambda 등)으로 연결해 주는 접수 창구예요.',
    icons: ['api_gateway'],
  },
  {
    term: 'API',
    description:
      '프로그램끼리 데이터를 주고받는 약속된 창구예요. 화면이 서버에 정보를 요청할 때 써요.',
  },
  {
    term: 'VPC',
    title: 'VPC (Virtual Private Cloud)',
    description: 'AWS 안에 만드는 우리 회사 전용 네트워크 공간이에요. 외부와 분리돼 있어요.',
    icons: ['vpc'],
  },
  {
    term: 'Multi-AZ',
    description:
      '데이터베이스나 서버를 서로 다른 데이터센터(AZ) 두 곳에 두는 구성이에요. 한 곳이 멈춰도 다른 곳이 이어받아요.',
  },
  {
    term: 'AZ',
    title: 'AZ (가용 영역)',
    description:
      '같은 지역 안에 떨어져 있는 독립된 데이터센터예요. 여러 AZ에 나눠 두면 한 곳에 사고가 나도 서비스가 유지돼요.',
  },
  {
    term: '서브넷',
    aliases: ['subnet'],
    description: 'VPC 네트워크를 용도별로 나눈 작은 구역이에요.',
  },
  {
    term: 'Private subnet',
    aliases: ['프라이빗 서브넷'],
    description:
      '인터넷에서 직접 들어올 수 없는 안쪽 구역이에요. 서버·DB를 안전하게 두는 곳이에요.',
  },
  {
    term: 'Public subnet',
    aliases: ['퍼블릭 서브넷'],
    description: '인터넷과 직접 연결되는 바깥쪽 구역이에요. 로드 밸런서 같은 입구를 둬요.',
  },
  {
    term: 'Internet Gateway',
    aliases: ['IGW'],
    description: 'VPC 네트워크와 인터넷을 잇는 출입문이에요.',
    icons: ['igw'],
  },
  {
    term: 'NAT Gateway',
    aliases: ['NAT'],
    description:
      '안쪽 구역의 서버가 밖(인터넷)으로 나갈 수만 있게 해 주는 장치예요. 켜져 있는 시간만큼 요금이 나가요.',
    icons: ['nat_gateway'],
  },
  {
    term: 'VPC Endpoint',
    aliases: ['VPC Interface Endpoint', 'Interface Endpoint'],
    title: 'VPC Endpoint',
    description:
      '인터넷을 거치지 않고 VPC 안에서 바로 AWS 서비스에 접속하게 해 주는 전용 통로예요.',
    icons: ['vpc_endpoint'],
  },
  {
    term: 'ENI',
    title: 'ENI (네트워크 인터페이스)',
    description: '서버나 Lambda가 VPC 네트워크에 연결될 때 쓰는 가상 랜카드예요.',
  },
  {
    term: 'DNS',
    description: '사람이 읽는 주소(example.com)를 컴퓨터 주소(IP)로 바꿔 주는 시스템이에요.',
  },
  {
    term: 'HTTPS',
    aliases: ['TLS'],
    title: 'HTTPS / TLS',
    description: '주고받는 데이터를 암호화해서 중간에서 훔쳐보지 못하게 하는 통신 방식이에요.',
  },
  {
    term: 'OAC',
    title: 'OAC (Origin Access Control)',
    description: 'CloudFront를 통해서만 S3 파일을 볼 수 있게 막아 주는 보안 설정이에요.',
  },
  {
    term: 'LCU',
    description: '로드 밸런서가 처리한 일의 양을 재는 요금 단위예요.',
  },

  // ---------- 데이터베이스·저장소 ----------
  {
    term: 'RDS',
    aliases: ['Amazon RDS'],
    title: 'RDS (Relational Database Service)',
    description: 'AWS가 설치·백업·관리를 대신해 주는 데이터베이스 서비스예요.',
    icons: ['rds'],
  },
  {
    term: 'Aurora Serverless v2',
    aliases: ['Aurora PostgreSQL Serverless v2'],
    description:
      '사용량에 따라 크기가 자동으로 바뀌는 Aurora 데이터베이스예요. 아무도 안 쓰면 스스로 멈출 수도 있어요.',
  },
  {
    term: 'Aurora',
    aliases: ['Amazon Aurora', 'Aurora PostgreSQL'],
    title: 'Amazon Aurora',
    description: 'AWS가 만든 고성능 데이터베이스예요. 데이터를 여러 곳에 자동으로 복제해 안전해요.',
    icons: ['aurora'],
  },
  {
    term: 'ACU',
    title: 'ACU (Aurora Capacity Unit)',
    description:
      'Aurora Serverless의 처리 능력 단위예요. "0 ACU"는 완전히 멈춰서 계산 비용이 0인 상태예요.',
  },
  {
    term: 'auto-pause',
    description:
      '아무도 쓰지 않으면 데이터베이스가 스스로 잠드는 기능이에요. 잠든 동안은 저장 비용만 나가요.',
  },
  {
    term: 'PostgreSQL',
    description: '전 세계에서 많이 쓰는 무료 데이터베이스 프로그램이에요.',
  },
  {
    term: 'DynamoDB',
    aliases: ['Amazon DynamoDB'],
    title: 'Amazon DynamoDB',
    description: '서버 관리 없이 쓰는 빠른 키-값 데이터베이스예요. 쓴 만큼만 돈을 내요.',
    icons: ['dynamodb'],
  },
  {
    term: 'ElastiCache',
    description: '자주 쓰는 데이터를 메모리에 올려 두고 빠르게 꺼내 주는 캐시 서비스예요.',
    icons: ['elasticache'],
  },
  {
    term: 'S3',
    aliases: ['Amazon S3'],
    title: 'Amazon S3',
    description: '파일(이미지, 문서, 백업)을 무제한으로 저장하는 AWS의 온라인 창고예요.',
    icons: ['s3'],
  },
  {
    term: 'EBS',
    description: 'EC2 서버에 붙이는 가상 하드디스크예요.',
  },
  {
    term: 'gp3',
    aliases: ['gp2'],
    title: 'gp3 / gp2',
    description: 'EBS·RDS 디스크 종류예요. gp3가 최신이라 같은 성능에 gp2보다 약 20% 싸요.',
  },
  {
    term: 'EFS',
    description: '여러 서버가 동시에 같이 쓰는 공유 폴더 같은 저장소예요.',
    icons: ['efs'],
  },
  {
    term: 'DB',
    description:
      '데이터베이스의 줄임말이에요. 회원 정보·주문 내역 같은 데이터를 저장하는 곳이에요.',
  },
  {
    term: 'RDS Proxy',
    description:
      'DB 연결을 모아서 관리해 주는 중간 관리자예요. 연결이 한꺼번에 몰려도 DB가 버티게 해 줘요.',
  },
  {
    term: 'DMS',
    aliases: ['AWS DMS'],
    title: 'AWS DMS (Database Migration Service)',
    description: '기존 데이터베이스의 데이터를 새 데이터베이스로 옮겨 주는 이사 도구예요.',
  },
  {
    term: 'CDC',
    title: 'CDC (변경 데이터 캡처)',
    description:
      '처음 데이터를 옮긴 뒤에도 바뀐 내용만 계속 따라 복사하는 방식이에요. 중단 시간을 줄여 줘요.',
  },

  // ---------- 보안·운영 ----------
  {
    term: 'Secrets Manager',
    aliases: ['AWS Secrets Manager'],
    title: 'AWS Secrets Manager',
    description: 'DB 비밀번호 같은 민감한 정보를 안전하게 보관하고 주기적으로 바꿔 주는 금고예요.',
    icons: ['secrets_manager'],
  },
  {
    term: 'CloudWatch',
    aliases: ['Amazon CloudWatch'],
    title: 'Amazon CloudWatch',
    description: '서버 상태·로그를 모아 보고, 문제가 생기면 알람을 보내 주는 모니터링 서비스예요.',
    icons: ['cloudwatch'],
  },
  {
    term: 'EventBridge',
    aliases: ['Amazon EventBridge'],
    title: 'Amazon EventBridge',
    description:
      '정해진 시간이나 사건이 생기면 다른 서비스를 자동으로 실행시켜 주는 알림·예약 장치예요.',
    icons: ['eventbridge'],
  },
  {
    term: 'Instance Scheduler',
    aliases: ['Instance Scheduler on AWS', 'AWS Instance Scheduler on AWS', 'Scheduler'],
    title: 'Instance Scheduler on AWS',
    description: '정해 둔 시간표대로 서버·DB를 자동으로 켜고 끄는 AWS 도구예요.',
  },
  {
    term: 'WAF',
    aliases: ['AWS WAF'],
    description: '해킹 같은 나쁜 요청을 걸러 주는 웹 방화벽이에요.',
    icons: ['waf'],
  },
  {
    term: 'RTO',
    title: 'RTO (목표 복구 시간)',
    description: '장애가 났을 때 몇 분 안에 서비스를 되살려야 하는지 정한 목표 시간이에요.',
  },
  {
    term: 'Compute Optimizer',
    description: '실제 사용량을 보고 서버 크기가 적당한지 추천해 주는 AWS 도구예요.',
  },
  {
    term: 'Trusted Advisor',
    description: '비용 낭비·보안 문제를 점검해서 알려 주는 AWS 도구예요.',
  },
  {
    term: 'Cost Explorer',
    description: 'AWS 요금이 어디에 얼마나 나갔는지 그래프로 보여 주는 도구예요.',
  },

  // ---------- 요금 ----------
  {
    term: 'Savings Plans',
    aliases: ['Compute Savings Plans'],
    description: '1년·3년 동안 일정 사용량을 약속하면 요금을 할인받는 약정 상품이에요.',
  },
  {
    term: 'Reserved Instance',
    aliases: ['RI'],
    title: 'RI (Reserved Instance, 예약 인스턴스)',
    description:
      '특정 서버를 1년·3년 쓰기로 약정하고 할인받는 방식이에요. 서버를 꺼 두는 시간이 많으면 오히려 손해예요.',
  },
  {
    term: '온디맨드',
    description: '약정 없이 쓴 시간만큼 정가로 내는 요금 방식이에요.',
  },
  {
    term: '프리티어',
    description: 'AWS가 일정 사용량까지 무료로 제공하는 혜택이에요.',
  },
]
