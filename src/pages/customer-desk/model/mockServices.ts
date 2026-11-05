import { ENGINEERS } from './script'
import type { ServiceRecord } from './types'

const [kimDoyun, parkSeoyeon, leeJunho] = ENGINEERS

/** API 연결 전까지 보여줄 내 서비스 목록 */
export const MOCK_SERVICES: ServiceRecord[] = [
  {
    id: 'clothing-shop',
    name: '의류 쇼핑몰',
    status: 'submitted',
    engineer: parkSeoyeon,
    registeredAt: '2026-11-05',
    answers: {
      concern: '월 클라우드 비용이 너무 많이 나와요. 세일 때 말고는 서버가 남는 것 같아요',
      priority: '요금 절감 > 안 멈추는 구조 > 관리 편한 구조',
      dailyUsers: '1만~10만 명',
      frozenParts: '결제 시스템',
    },
  },
  {
    id: 'booking-app',
    name: '예약 앱',
    status: 'analyzed',
    engineer: leeJunho,
    registeredAt: '2026-10-28',
    answers: {
      concern: '예약이 몰리는 월요일 아침마다 앱이 느려져요',
      priority: '안 멈추는 구조 > 늘어도 버티는 구조',
      dailyUsers: '1천~1만 명',
      frozenParts: '예약 데이터베이스',
    },
  },
  {
    id: 'intranet',
    name: '사내 포털',
    status: 'recommended',
    engineer: kimDoyun,
    registeredAt: '2026-10-14',
    answers: {
      concern: '보안 점검을 한 번도 안 받아 봐서 걱정돼요',
      priority: '보안 점검 > 관리 편한 구조',
      dailyUsers: '1천 명 미만',
      frozenParts: '사내 로그인(SSO)',
    },
  },
]
