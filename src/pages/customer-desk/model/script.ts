import type { Answers, FieldKey, Prompt } from './types'

/**
 * 고객 창구 대화 대본. 질문 문구와 선택지는 프론트가 정한다.
 * 실제로는 AI가 대화에서 항목을 뽑아내지만, 지금은 질문 하나에 항목 하나씩 채운다.
 * 답은 제출할 때 QUESTION_LABEL 을 키로 하는 answers 로 서버에 보낸다.
 */

export const SUGGESTIONS = ['요금을 줄이고 싶어요', '서비스가 자주 멈춰요', '보안이 걱정돼요']

export const OUTCOME_OPTIONS = [
  '요금 절감',
  '안 멈추는 구조',
  '늘어도 버티는 구조',
  '보안 점검',
  '관리 편한 구조',
  '전반 진단',
]

/** 수집한 정보 패널에서 쓰는 짧은 이름 */
const OUTCOME_SHORT: Record<string, string> = {
  '요금 절감': '요금',
  '안 멈추는 구조': '안 멈춤',
  '늘어도 버티는 구조': '확장',
  '보안 점검': '보안',
  '관리 편한 구조': '관리 편함',
  '전반 진단': '전반 진단',
}

const IMPACT_SHORT: Record<string, string> = {
  '크게 문제없어요': '매출 영향 적음',
  '일부 업무가 불편해요': '일부 업무 영향',
  '매출이나 고객에게 바로 영향이 있어요': '매출 영향 큼',
  '사업 전체가 멈춰요': '사업 전체 영향',
}

/** 여러 개 고른 답은 이 구분자로 이어 붙인다 */
export const LIST_SEPARATOR = ', '
export const RANK_SEPARATOR = ' > '

export interface ScriptStep {
  field: FieldKey
  message: string
  /** 앞선 답을 보고 선택지를 만든다 (우선순위: 고른 결과 중에서만) */
  prompt: Prompt | ((answers: Answers) => Prompt)
  /** 대화체 답에서 저장할 값만 뽑는다. 실제로는 AI가 하는 일을 목업으로 흉내 낸다 */
  extract?: (answer: string) => string
}

/** "결제 시스템은 바꾸면 안 돼요" → "결제 시스템" */
const extractFrozenPart = (answer: string) =>
  answer.match(
    /^(.+?)(?:은|는|이|가|을|를)?\s*(?:절대\s*)?(?:바꾸|바뀌|건드리|손대|변경하)/,
  )?.[1] ?? answer

export const SCRIPT: ScriptStep[] = [
  {
    field: 'concern',
    message: '안녕하세요! 어떤 고민이 있어서 검토를 신청하셨나요?',
    prompt: { kind: 'text' },
  },
  {
    field: 'outcomes',
    message: '그렇군요. 검토가 끝나면 어떤 걸 받아 보고 싶으세요? 여러 개 골라도 돼요.',
    prompt: { kind: 'multi', options: OUTCOME_OPTIONS },
  },
  {
    field: 'priority',
    message: '고른 것 중에서 더 중요한 것부터 순서대로 눌러 주세요.',
    prompt: (answers) => ({
      kind: 'ranked',
      options: answers.outcomes?.split(LIST_SEPARATOR) ?? OUTCOME_OPTIONS,
    }),
  },
  {
    field: 'costGoal',
    message: '월 클라우드 비용은 앞으로 어떻게 되면 좋겠어요?',
    prompt: {
      kind: 'single',
      options: ['줄었으면 좋겠어요', '지금 정도면 괜찮아요', '조금 늘어도 괜찮아요'],
    },
  },
  {
    field: 'serviceName',
    message: '어떤 서비스를 검토받고 싶으세요? 서비스 이름을 알려 주세요.',
    prompt: { kind: 'text' },
  },
  {
    field: 'serviceIntro',
    message: '어떤 서비스인지 한두 문장으로 소개해 주세요.',
    prompt: { kind: 'text' },
  },
  {
    field: 'dailyUsers',
    message: '하루에 몇 명쯤 쓰나요?',
    prompt: {
      kind: 'single',
      options: ['1천 명 미만', '1천~1만 명', '1만~10만 명', '10만 명 이상'],
    },
  },
  {
    field: 'peakTime',
    message: '사용자가 몰리는 때가 있나요? 여러 개 골라도 돼요.',
    prompt: {
      kind: 'multi',
      options: ['아침', '점심', '저녁', '주말', '세일·이벤트 때', '딱히 없어요'],
    },
  },
  {
    field: 'growth',
    message: '1년 뒤에는 사용자가 얼마나 될 것 같아요?',
    prompt: {
      kind: 'single',
      options: ['지금과 비슷할 것 같아요', '2배쯤 늘 것 같아요', '훨씬 많이 늘 것 같아요'],
    },
  },
  {
    field: 'downtimeImpact',
    message: '고마워요. 서비스가 갑자기 멈추면 어떤 일이 생기나요?',
    prompt: {
      kind: 'single',
      options: [
        '크게 문제없어요',
        '일부 업무가 불편해요',
        '매출이나 고객에게 바로 영향이 있어요',
        '사업 전체가 멈춰요',
      ],
    },
  },
  {
    field: 'tolerance',
    message: '멈춘다면 어디까지 괜찮을까요?',
    prompt: {
      kind: 'single',
      options: [
        '몇 분도 멈추면 안 돼요',
        '최대 1시간 멈춤, 데이터는 몇 분 치까지',
        '반나절 정도는 괜찮아요',
      ],
    },
  },
  {
    field: 'personalData',
    message: '이름이나 연락처 같은 개인정보를 다루나요?',
    prompt: {
      kind: 'single',
      options: ['네, 회원 이름, 연락처, 주소', '네, 결제 정보까지', '아니요, 다루지 않아요'],
    },
  },
  {
    field: 'compliance',
    message: '지켜야 하는 규정이나 인증이 있나요?',
    prompt: { kind: 'single', options: ['ISMS 인증', '개인정보보호법', '잘 모르겠어요'] },
  },
  {
    field: 'changeAllowance',
    message: '검토하면서 어디까지 바꿔도 될까요? 여러 개 골라도 돼요.',
    prompt: {
      kind: 'multi',
      options: [
        '잠깐 중단은 괜찮아요',
        '관리형 전환·서버 변경은 맡길게요',
        '지금 구조는 최대한 유지하고 싶어요',
      ],
    },
  },
  {
    field: 'serverOps',
    message: '서버는 지금 누가 관리하나요?',
    prompt: {
      kind: 'single',
      options: ['사내 개발자가 직접', '외부 업체에 맡겨요', '관리하는 사람이 없어요'],
    },
  },
  {
    field: 'frozenParts',
    message: '마지막으로, 절대 바꾸면 안 되는 부분이 있나요?',
    prompt: { kind: 'text' },
    extract: extractFrozenPart,
  },
]

export const ENGINEER_MESSAGE =
  '필요한 내용을 다 모았어요. 답변을 전달할 담당 엔지니어를 골라 주세요.'

/**
 * 서버에 보내는 answers 의 키(질문 라벨). 엔지니어가 프로젝트 화면에서 그대로 읽고 AI 입력에도
 * "라벨: 답" 으로 들어가므로 짧아도 무슨 질문인지 알 수 있게 쓴다.
 * 이미 등록된 서비스의 답변은 이 문구로 저장돼 있어서, 바꾸면 내 서비스 화면의 표시 순서가 어긋난다.
 */
export const QUESTION_LABEL: Record<FieldKey, string> = {
  concern: '검토를 신청한 고민',
  outcomes: '검토 후 받고 싶은 결과',
  priority: '결과 우선순위',
  costGoal: '월 클라우드 비용 목표',
  serviceName: '서비스 이름',
  serviceIntro: '서비스 소개',
  dailyUsers: '하루 사용자 수',
  peakTime: '사용자가 몰리는 때',
  growth: '1년 뒤 예상 사용자',
  downtimeImpact: '서비스가 멈췄을 때 영향',
  tolerance: '허용할 수 있는 중단 범위',
  personalData: '다루는 개인정보',
  compliance: '지켜야 하는 규정·인증',
  changeAllowance: '검토하면서 바꿔도 되는 범위',
  serverOps: '서버 관리 주체',
  frozenParts: '절대 바꾸면 안 되는 부분',
}

/* ---------- 수집한 정보 패널 (대화 화면 오른쪽) ---------- */

export interface InfoItem {
  label: string
  /** 이 항목들이 모두 채워지면 완료 */
  fields: FieldKey[]
  summarize: (answers: Answers) => string | undefined
}

const shortList = (value: string | undefined, separator: string, short: Record<string, string>) =>
  value
    ?.split(separator)
    .map((item) => short[item] ?? item)
    .join(RANK_SEPARATOR)

export const INFO_ITEMS: InfoItem[] = [
  { label: '고민', fields: ['concern'], summarize: (a) => a.concern },
  {
    label: '받고 싶은 결과',
    fields: ['outcomes'],
    summarize: ({ outcomes }) => {
      const items = outcomes?.split(LIST_SEPARATOR)
      if (!items) return undefined
      return items.length > 1 ? `${items[0]} 외 ${items.length - 1}개` : items[0]
    },
  },
  {
    label: '우선순위',
    fields: ['priority'],
    summarize: (a) => shortList(a.priority, RANK_SEPARATOR, OUTCOME_SHORT),
  },
  { label: '월 비용', fields: ['costGoal'], summarize: (a) => a.costGoal },
  {
    label: '서비스',
    fields: ['serviceName', 'serviceIntro', 'dailyUsers', 'peakTime', 'growth'],
    summarize: ({ serviceName, dailyUsers }) =>
      serviceName && [serviceName, dailyUsers && `하루 ${dailyUsers}`].filter(Boolean).join(', '),
  },
  {
    label: '꼭 지킬 것',
    fields: [
      'downtimeImpact',
      'tolerance',
      'personalData',
      'compliance',
      'changeAllowance',
      'serverOps',
      'frozenParts',
    ],
    summarize: ({ downtimeImpact, frozenParts }) => {
      const parts = [
        downtimeImpact && (IMPACT_SHORT[downtimeImpact] ?? downtimeImpact),
        frozenParts && `${frozenParts} 변경 불가`,
      ].filter(Boolean)
      return parts.length ? parts.join(', ') : undefined
    },
  },
]

/* ---------- 제출 전 확인 화면 ---------- */

export interface ReviewGroup {
  title: string
  rows: { field: FieldKey; label: string }[]
}

export const REVIEW_GROUPS: ReviewGroup[] = [
  {
    title: '무엇을 바라시나요',
    rows: [
      { field: 'concern', label: '고민' },
      { field: 'outcomes', label: '받고 싶은 결과' },
      { field: 'priority', label: '우선순위' },
      { field: 'costGoal', label: '월 비용' },
    ],
  },
  {
    title: '어떤 서비스인가요',
    rows: [
      { field: 'serviceName', label: '서비스 이름' },
      { field: 'serviceIntro', label: '소개' },
      { field: 'dailyUsers', label: '하루 사용자' },
      { field: 'peakTime', label: '몰리는 때' },
      { field: 'growth', label: '1년 뒤' },
    ],
  },
  {
    title: '꼭 지켜야 할 것',
    rows: [
      { field: 'downtimeImpact', label: '멈췄을 때 영향' },
      { field: 'tolerance', label: '허용 범위' },
      { field: 'personalData', label: '개인정보' },
      { field: 'compliance', label: '규정·인증' },
      { field: 'frozenParts', label: '손대면 안 되는 부분' },
      { field: 'changeAllowance', label: '변화 허용' },
      { field: 'serverOps', label: '서버 관리' },
    ],
  },
]

export const REVIEW_FIELDS = REVIEW_GROUPS.flatMap((group) => group.rows.map((row) => row.field))
