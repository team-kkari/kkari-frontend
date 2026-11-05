import { useState } from 'react'
import { CustomerSidebar } from '@/widgets/customer-sidebar'
import { MOCK_SERVICES } from '../model/mockServices'
import type { ServiceRecord } from '../model/types'
import { useCustomerDesk } from '../model/useCustomerDesk'
import { ChatView } from './ChatView'
import { InfoPanel } from './InfoPanel'
import { ReviewView } from './ReviewView'
import { ServiceStatusView } from './ServiceStatusView'
import { StartView } from './StartView'
import styles from './CustomerDeskPage.module.css'

let serviceSeq = 0

/** 오늘 날짜 (YYYY-MM-DD, 로컬 기준) */
const today = () => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * 고객 창구: 고객이 AI와 대화하며 요구사항을 정리해 담당 엔지니어에게 제출한다.
 * 내 서비스를 고르면 그 서비스의 진행 상태를 보여준다
 */
export function CustomerDeskPage() {
  const desk = useCustomerDesk()
  const [services, setServices] = useState<ServiceRecord[]>(MOCK_SERVICES)
  /** 보고 있는 서비스. 없으면 고객 창구(대화) */
  const [serviceId, setServiceId] = useState<string>()
  const service = services.find((s) => s.id === serviceId)

  // 제출하면 내 서비스 맨 위에 '접수됨'으로 올리고 진행 상태 화면으로 보낸다
  const submit = () => {
    if (!desk.engineer) return
    const record: ServiceRecord = {
      id: `new-${++serviceSeq}`,
      name: desk.answers.serviceName ?? '새 서비스',
      status: 'submitted',
      engineer: desk.engineer,
      registeredAt: today(),
      answers: desk.answers,
    }
    setServices((prev) => [record, ...prev])
    setServiceId(record.id)
    desk.reset()
  }

  const startNewService = () => {
    setServiceId(undefined)
    desk.reset()
  }

  return (
    <div className={styles.page}>
      <CustomerSidebar
        services={services}
        activeServiceId={serviceId}
        userName="testUser"
        onNewService={startNewService}
        onOpenDesk={() => setServiceId(undefined)}
        onSelectService={setServiceId}
      />

      <main className={styles.main}>
        {service ? (
          <ServiceStatusView key={service.id} service={service} />
        ) : (
          <>
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
            {desk.stage === 'review' && (
              <ReviewView
                answers={desk.answers}
                engineer={desk.engineer}
                onEdit={desk.editAnswer}
                onChangeEngineer={desk.setEngineer}
                onBack={desk.backToChat}
                onSubmit={submit}
              />
            )}
          </>
        )}
      </main>

      {!service && desk.stage === 'chat' && (
        <InfoPanel answers={desk.answers} engineer={desk.engineer} />
      )}
    </div>
  )
}
