import {
  ANSWER_VALUE_MAX_LENGTH,
  SERVICE_NAME_MAX_LENGTH,
  type RegisterServiceBody,
} from '@/entities/customer-service'
import type { Engineer } from '@/entities/engineer'
import { QUESTION_LABEL, SCRIPT } from './script'
import type { Answers } from './types'

/** 서비스 이름을 못 구했을 때 (이름·소개 답이 모두 비었을 때만) */
const FALLBACK_SERVICE_NAME = '새 서비스'

/**
 * 서버에 보낼 서비스 이름. 서비스 이름 답을 쓰고, 없으면 서비스 소개로 대신한다.
 * 서버가 100자까지만 받고 빈 값은 거부하므로 자르고, 끝까지 없으면 기본 이름을 쓴다.
 */
export function resolveServiceName(answers: Answers): string {
  const name = answers.serviceName?.trim() || answers.serviceIntro?.trim()
  return name ? name.slice(0, SERVICE_NAME_MAX_LENGTH) : FALLBACK_SERVICE_NAME
}

/**
 * 대화에서 모은 답을 서비스 등록 요청으로 바꾼다.
 * answers 의 키는 사람이 읽는 질문 라벨이고, 빈 답은 보내지 않는다. 대본 순서대로 담는다.
 */
export function buildRegisterServiceBody(
  answers: Answers,
  engineer: Engineer,
): RegisterServiceBody {
  const entries = SCRIPT.flatMap(({ field }): [string, string][] => {
    const value = answers[field]?.trim()
    return value ? [[QUESTION_LABEL[field], value.slice(0, ANSWER_VALUE_MAX_LENGTH)]] : []
  })
  return {
    serviceName: resolveServiceName(answers),
    answers: Object.fromEntries(entries),
    engineerId: engineer.engineerId,
  }
}

/** 질문 라벨 순서. 서버가 답변 순서를 보존하지 않으므로 화면에서 이 순서로 다시 맞춘다 */
const LABEL_ORDER = SCRIPT.map(({ field }) => QUESTION_LABEL[field])

/**
 * 서버에서 받은 answers 를 화면에 보여줄 [질문, 답] 목록으로 만든다.
 * 대본의 질문 순서대로 놓고, 대본에 없는 질문(다른 경로로 등록한 것)은 뒤에 받은 순서대로 붙인다.
 */
export function listServiceAnswers(
  answers: Record<string, string> | null | undefined,
): [question: string, answer: string][] {
  const entries = Object.entries(answers ?? {}).filter(([, answer]) => answer?.trim())
  const rank = (question: string) => {
    const index = LABEL_ORDER.indexOf(question)
    return index === -1 ? LABEL_ORDER.length : index
  }
  // sort 는 안정 정렬이라 대본에 없는 질문끼리는 받은 순서가 유지된다
  return entries.sort(([a], [b]) => rank(a) - rank(b))
}
