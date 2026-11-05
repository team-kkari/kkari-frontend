import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { customerServiceQueries, registerService } from '@/entities/customer-service'
import { engineerQueries } from '@/entities/engineer'
import { userQueries } from '@/entities/user'
import { useLogout } from '@/features/logout'
import { ApiError } from '@/shared/api'
import { CustomerSidebar } from '@/widgets/customer-sidebar'
import { buildRegisterServiceBody } from '../model/serviceAnswers'
import { useCustomerDesk } from '../model/useCustomerDesk'
import { ChatView } from './ChatView'
import { InfoPanel } from './InfoPanel'
import { ReviewView } from './ReviewView'
import { ServiceStatusView } from './ServiceStatusView'
import { StartView } from './StartView'
import styles from './CustomerDeskPage.module.css'

/** 내 정보를 못 불러왔을 때(아직 없는 서버 등) 사이드바에 보여줄 이름 */
const FALLBACK_USER_NAME = '고객'

/**
 * 고객 창구: 고객이 AI와 대화하며 요구사항을 정리해 담당 엔지니어에게 제출한다.
 * 내 서비스를 고르면 그 서비스의 진행 상태를 보여준다
 */
export function CustomerDeskPage() {
  const desk = useCustomerDesk()
  const queryClient = useQueryClient()
  const logout = useLogout()
  const { data: me } = useQuery(userQueries.me())
  /** 보고 있는 서비스(serviceId). 없으면 고객 창구(대화) */
  const [serviceId, setServiceId] = useState<number>()

  // 제출하면 목록을 다시 받고 방금 접수한 서비스의 진행 상태 화면으로 보낸다
  const register = useMutation({
    mutationFn: registerService,
    onSuccess: ({ serviceId: createdId }) => {
      void queryClient.invalidateQueries({ queryKey: customerServiceQueries.all() })
      setServiceId(createdId)
      desk.reset()
    },
  })

  const submit = () => {
    if (!desk.engineer) return
    register.mutate(buildRegisterServiceBody(desk.answers, desk.engineer))
  }

  const submitError = register.isError
    ? register.error instanceof ApiError
      ? register.error.message
      : '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'
    : undefined

  // 대화를 새로 시작할 때 엔지니어 목록을 미리 받아 둔다 (선택 창이 바로 뜨도록)
  const start = (text: string) => {
    void queryClient.prefetchQuery(engineerQueries.list())
    desk.start(text)
  }

  const backToChat = () => {
    register.reset()
    desk.backToChat()
  }

  const startNewService = () => {
    register.reset()
    setServiceId(undefined)
    desk.reset()
  }

  return (
    <div className={styles.page}>
      <CustomerSidebar
        activeServiceId={serviceId}
        userName={me?.name || FALLBACK_USER_NAME}
        onNewService={startNewService}
        onOpenDesk={() => setServiceId(undefined)}
        onSelectService={setServiceId}
        onLogout={logout}
      />

      <main className={styles.main}>
        {serviceId !== undefined ? (
          <ServiceStatusView key={serviceId} serviceId={serviceId} />
        ) : (
          <>
            {desk.stage === 'start' && <StartView onStart={start} />}
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
                onBack={backToChat}
                onSubmit={submit}
                isSubmitting={register.isPending}
                submitError={submitError}
              />
            )}
          </>
        )}
      </main>

      {serviceId === undefined && desk.stage === 'chat' && (
        <InfoPanel answers={desk.answers} engineer={desk.engineer} />
      )}
    </div>
  )
}
