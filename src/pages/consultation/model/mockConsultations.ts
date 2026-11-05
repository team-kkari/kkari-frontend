import { CLOSING_MESSAGE, GREETING, SCRIPT } from './script'
import type { ChatMessage, Consultation, ConsultationSnapshot } from './types'

/**
 * API 연결 전까지 사이드바에 보여줄 완료된 의뢰 목업.
 * 시나리오(SCRIPT)를 그대로 따라 답한 대화 기록을 만든다.
 */

interface MockAnswers {
  customer: string
  request: string
  firstMessage: string
  priority: string
  budget: string
  connection: 'aws' | 'terraform'
  roleArn?: string
  file?: { name: string; size: number }
}

function buildDoneSnapshot(id: string, a: MockAnswers): ConsultationSnapshot {
  let seq = 0
  const mid = () => `${id}-m${++seq}`
  const [, customerStep, priorityStep, budgetStep, connectStep] = SCRIPT
  const option = connectStep.choice!.options.find((o) => o.id === a.connection)!

  const messages: ChatMessage[] = [
    { id: mid(), role: 'ai', text: GREETING },
    { id: mid(), role: 'user', text: a.firstMessage },
    { id: mid(), role: 'ai', text: customerStep.message },
    { id: mid(), role: 'user', text: a.customer },
    { id: mid(), role: 'ai', text: priorityStep.message },
    { id: mid(), role: 'user', text: a.priority },
    { id: mid(), role: 'ai', text: budgetStep.message },
    { id: mid(), role: 'user', text: a.budget },
    {
      id: mid(),
      role: 'ai',
      text: connectStep.message,
      choice: { ...connectStep.choice!, selectedId: option.id },
    },
    {
      id: mid(),
      role: 'ai',
      text: option.followUp!.message,
      connect: {
        kind: option.followUp!.connect,
        done: true,
        result: { roleArn: a.roleArn, file: a.file },
      },
    },
    { id: mid(), role: 'ai', text: CLOSING_MESSAGE, confirm: { done: true } },
  ]

  return {
    stage: 'chat',
    messages,
    stepIndex: SCRIPT.length,
    info: {
      customer: a.customer,
      request: a.request,
      priority: a.priority,
      budget: a.budget,
      // 실제 흐름(completeConnect)과 같은 형식
      infraConnection: a.file ? `Terraform · ${a.file.name}` : option.label,
      infraAnalysis: '완료',
    },
  }
}

const doneConsultation = (id: string, answers: MockAnswers): Consultation => ({
  id,
  name: answers.customer,
  status: 'done',
  initial: buildDoneSnapshot(id, answers),
})

export const MOCK_DONE_CONSULTATIONS: Consultation[] = [
  doneConsultation('mock-1', {
    customer: 'B 커머스',
    request: '트래픽 대응',
    firstMessage: '세일 기간마다 서버가 버티질 못해요',
    priority: '성능',
    budget: '월 500만 원',
    connection: 'aws',
    roleArn: 'arn:aws:iam::482910375516:role/WaycoReadOnly',
  }),
  doneConsultation('mock-2', {
    customer: 'C 핀테크',
    request: '보안 강화',
    firstMessage: '보안 감사 대비가 필요해요',
    priority: '보안',
    budget: '월 800만 원',
    connection: 'terraform',
    file: { name: 'c-fintech-prod.tfstate', size: 2_340_000 },
  }),
  doneConsultation('mock-3', {
    customer: 'D 물류',
    request: '비용 절감',
    firstMessage: '안 쓰는 리소스가 많은 것 같아요',
    priority: '비용',
    budget: '월 200만 원',
    connection: 'aws',
    roleArn: 'arn:aws:iam::730215846629:role/WaycoReadOnly',
  }),
]
