import { useState } from 'react'
import { CustomerSidebar, type CustomerService } from '@/widgets/customer-sidebar'
import { useCustomerDesk } from '../model/useCustomerDesk'
import { ChatView } from './ChatView'
import { InfoPanel } from './InfoPanel'
import { ReviewView } from './ReviewView'
import { StartView } from './StartView'
import styles from './CustomerDeskPage.module.css'

/** API 연결 전까지 보여줄 내 서비스 목록 */
const MOCK_SERVICES: CustomerService[] = [
  { id: 'clothing-shop', name: '의류 쇼핑몰', status: 'submitted' },
  { id: 'booking-app', name: '예약 앱', status: 'analyzed' },
  { id: 'intranet', name: '사내 포털', status: 'recommended' },
]

let serviceSeq = 0

/** 고객 창구: 고객이 AI와 대화하며 요구사항을 정리해 담당 엔지니어에게 제출한다 */
export function CustomerDeskPage() {
  const desk = useCustomerDesk()
  const [services, setServices] = useState(MOCK_SERVICES)

  // 제출하면 내 서비스 목록 맨 위에 '접수됨'으로 올린다
  const submit = () => {
    desk.submit()
    setServices((prev) => [
      {
        id: `new-${++serviceSeq}`,
        name: desk.answers.serviceName ?? '새 서비스',
        status: 'submitted',
      },
      ...prev,
    ])
  }

  return (
    <div className={styles.page}>
      <CustomerSidebar services={services} userName="testUser" onNewService={desk.reset} />

      <main className={styles.main}>
        {desk.stage === 'start' && <StartView onStart={desk.start} />}
        {desk.stage === 'chat' && (
          <ChatView
            messages={desk.messages}
            engineer={desk.engineer}
            isAiTyping={desk.isAiTyping}
            canType={desk.canType}
            onAnswer={desk.answer}
            onChooseEngineer={desk.chooseEngineer}
          />
        )}
        {(desk.stage === 'review' || desk.stage === 'submitted') && (
          <ReviewView
            answers={desk.answers}
            engineer={desk.engineer}
            submitted={desk.stage === 'submitted'}
            onEdit={desk.editAnswer}
            onChangeEngineer={desk.setEngineer}
            onBack={desk.backToChat}
            onSubmit={submit}
          />
        )}
      </main>

      {desk.stage === 'chat' && <InfoPanel answers={desk.answers} engineer={desk.engineer} />}
    </div>
  )
}
