import type { ChoiceCard, CollectedInfo, InfoKey } from './types'

/**
 * API 연결 전까지 쓰는 목업 대화 시나리오.
 * 사용자의 답변을 받을 때마다 다음 단계로 넘어가고, 수집한 정보를 채운다.
 */

export const INFO_ITEMS: { key: InfoKey; label: string }[] = [
  { key: 'customer', label: '고객사' },
  { key: 'request', label: '의뢰 내용' },
  { key: 'priority', label: '우선순위' },
  { key: 'budget', label: '월 예산' },
  { key: 'infraConnection', label: '인프라 연결' },
  { key: 'infraAnalysis', label: '인프라 분석' },
]

/** 시작 화면 제목과 같은 질문으로 대화를 연다 */
export const GREETING = '안녕하세요! 어떤 인프라 고민이 있나요?'

/** 시작 화면 예시. 누르면 바로 쓸 수 있게 상황만 쓴다 (고객사 이름은 대화에서 묻는다) */
export const SUGGESTIONS = [
  '비용을 줄이고 싶어요',
  '보안을 강화하고 싶어요',
  '새 서비스를 설계하고 싶어요',
]

export interface ScriptStep {
  /** 이 단계에서 AI가 보내는 메시지 */
  message: string
  /** 텍스트 대신 선택지로 답을 받는 단계 */
  choice?: Omit<ChoiceCard, 'selectedId'>
  /** 입력창 위에 띄우는 빠른 답변. '기타'를 고르면 직접 입력한다 */
  quickReplies?: string[]
  /** 사용자의 답으로 채울 정보 */
  collect: (answer: string) => CollectedInfo
}

export const SCRIPT: ScriptStep[] = [
  {
    message: GREETING,
    // 실제로는 AI가 답변에서 요약해 추출. 지금은 답을 그대로 쓴다
    collect: (answer) => ({ request: answer }),
  },
  {
    message: '알겠어요. 어느 고객사의 의뢰인가요?',
    collect: (answer) => ({ customer: answer }),
  },
  {
    message: '최적화할 때 가장 중요한 건 뭔가요?',
    quickReplies: ['비용', '성능', '안정성', '보안'],
    collect: (answer) => ({ priority: answer }),
  },
  {
    message: '월 예산은 어느 정도로 생각하고 계세요?',
    collect: (answer) => ({ budget: answer }),
  },
  {
    message: '인프라 연결을 진행할게요.',
    choice: {
      question: '인프라 정보를 어떻게 연결할까요?',
      defaultId: 'aws',
      options: [
        {
          id: 'aws',
          label: 'AWS 계정 연결',
          description: '실시간 비용·사용률까지 분석',
          followUp: { message: '고객사 AWS 계정을 연결할게요.', connect: 'aws' },
        },
        {
          id: 'terraform',
          label: 'Terraform 파일 업로드',
          description: '계정 연결 없이 구조만 분석',
          followUp: { message: 'Terraform state 파일을 올려 주세요.', connect: 'terraform' },
        },
      ],
    },
    collect: (answer) => ({ infraConnection: answer, infraAnalysis: '완료' }),
  },
]

/** AWS 연결 시 고객사에 전달할 External ID (목업) */
export const MOCK_EXTERNAL_ID = 'a8f3-21cd-7e90'

export const CLOSING_MESSAGE = '필요한 정보를 모두 모았어요. 이 내용으로 아키텍처를 설계할까요?'

/** 요약 카드를 채팅으로 고칠 때, 어떤 항목인지 못 알아들으면 보내는 안내 */
export const EDIT_HELP_MESSAGE =
  "어떤 항목을 바꿀지 잘 모르겠어요. '예산 250만 원으로 바꿔줘'처럼 말씀해 주세요."

/** 채팅으로 고칠 수 있는 항목과 알아듣는 단어 (긴 단어부터 확인) */
const EDIT_KEYWORDS: { key: InfoKey; words: string[] }[] = [
  { key: 'budget', words: ['월 예산', '예산'] },
  { key: 'priority', words: ['우선순위', '중요한 건', '중요한 것'] },
  { key: 'customer', words: ['고객사', '회사'] },
  { key: 'request', words: ['의뢰 내용', '의뢰', '요청'] },
]

/**
 * [목업] "예산 250만 원으로 바꿔줘" → { key: 'budget', value: '250만 원' }.
 * 실제로는 AI가 메시지를 해석해 수정할 항목과 값을 돌려준다.
 */
export function parseInfoEdit(text: string): { key: InfoKey; value: string } | null {
  for (const { key, words } of EDIT_KEYWORDS) {
    for (const word of words) {
      const index = text.indexOf(word)
      if (index < 0) continue
      const value = text
        .slice(index + word.length)
        .trim()
        .replace(/^(은|는|을|를|이|가)\s+/, '')
        .replace(/\s*(으로|로)?\s*(바꿔|변경|수정|고쳐|해\s*줘|해\s*주세요).*$/, '')
        .trim()
      if (value) return { key, value }
    }
  }
  return null
}

export const DESIGN_STEPS: { label: string; doneMeta?: string }[] = [
  { label: '요구사항 정리' },
  { label: 'Best Practice 검색', doneMeta: '5개 찾음' },
  { label: '아키텍처 조합 중' },
  { label: 'WAF 점수 계산' },
]

/** 목업 AI 응답 지연 (ms) */
export const AI_DELAY = 1500
export const DESIGN_STEP_DELAY = 1500
/** 마지막 단계까지 끝난 뒤 결과 화면으로 넘어가기 전 잠깐 보여주는 시간 (ms) */
export const DESIGN_COMPLETE_DELAY = 800
