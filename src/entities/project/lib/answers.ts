/**
 * 고객 답변(질문 → 답)을 화면 구역으로 나눈다.
 * 서버는 답변 순서를 보존하지 않으므로, 고객 창구가 쓰는 질문 문구를 아는 만큼 정해진 순서로 놓는다.
 * 고객 창구의 질문 문구가 바뀌어도 모르는 질문은 "그 외 답변"에 받은 순서대로 보여준다.
 * (entities 는 pages 를 import 할 수 없어서 질문 문구를 여기에 따로 둔다)
 */
const KNOWN_SECTIONS: { title: string; questions: string[] }[] = [
  {
    title: '무엇을 바라시나요',
    questions: [
      '검토를 신청한 고민',
      '검토 후 받고 싶은 결과',
      '결과 우선순위',
      '월 클라우드 비용 목표',
    ],
  },
  {
    title: '어떤 서비스인가요',
    questions: [
      '서비스 이름',
      '서비스 소개',
      '하루 사용자 수',
      '사용자가 몰리는 때',
      '1년 뒤 예상 사용자',
    ],
  },
  {
    title: '꼭 지켜야 할 것',
    questions: [
      '서비스가 멈췄을 때 영향',
      '허용할 수 있는 중단 범위',
      '다루는 개인정보',
      '지켜야 하는 규정·인증',
      '검토하면서 바꿔도 되는 범위',
      '서버 관리 주체',
      '절대 바꾸면 안 되는 부분',
    ],
  },
]

export interface AnswerRow {
  question: string
  /** 답하지 않은 질문이면 undefined */
  answer?: string
}

export interface AnswerSection {
  number: string
  title: string
  rows: AnswerRow[]
}

const OTHER_TITLE = '그 외 답변'
const ONLY_TITLE = '고객 답변'

/** 답변 맵을 구역별 목록으로 만든다. 답변이 하나도 없으면 빈 배열 */
export function groupAnswers(answers: Record<string, string> | null | undefined): AnswerSection[] {
  const entries = Object.entries(answers ?? {}).filter(([, answer]) => answer?.trim())
  if (entries.length === 0) return []

  const answered = new Map(entries.map(([question, answer]) => [question, answer.trim()]))
  const known = new Set(KNOWN_SECTIONS.flatMap((section) => section.questions))

  const sections: Omit<AnswerSection, 'number'>[] = []
  for (const { title, questions } of KNOWN_SECTIONS) {
    // 구역에 답이 하나라도 있을 때만 보여주고, 답하지 않은 질문은 흐리게 보여준다
    if (!questions.some((question) => answered.has(question))) continue
    sections.push({
      title,
      rows: questions.map((question) => ({ question, answer: answered.get(question) })),
    })
  }

  const others = [...answered].filter(([question]) => !known.has(question))
  if (others.length > 0) {
    sections.push({
      title: sections.length === 0 ? ONLY_TITLE : OTHER_TITLE,
      rows: others.map(([question, answer]) => ({ question, answer })),
    })
  }

  return sections.map((section, index) => ({
    ...section,
    number: String(index + 1).padStart(2, '0'),
  }))
}
