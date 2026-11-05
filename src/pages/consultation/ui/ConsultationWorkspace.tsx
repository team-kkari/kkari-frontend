import { useEffect, useRef } from 'react'
import type { ConsultationSnapshot, ConsultationStatus } from '../model/types'
import { useConsultation } from '../model/useConsultation'
import { ChatView } from './ChatView'
import { DesigningView } from './DesigningView'
import { InfoPanel } from './InfoPanel'
import { StartView } from './StartView'
import styles from './ConsultationWorkspace.module.css'

interface ConsultationWorkspaceProps {
  active: boolean
  status: ConsultationStatus
  initial?: ConsultationSnapshot
  /** 첫 메시지를 보냈을 때 */
  onStarted: () => void
  /** 대화에서 고객사 이름을 알게 됐을 때 */
  onNameChange: (name: string) => void
  /** 아키텍처 설계가 끝났을 때 */
  onDesignComplete: () => void
}

/**
 * 의뢰 하나의 작업 영역(대화 + 수집한 정보).
 * 사이드바로 다른 의뢰를 봐도 진행 상태가 유지되게, 보이지 않을 때도 언마운트하지 않고 숨긴다.
 */
export function ConsultationWorkspace({
  active,
  status,
  initial,
  onStarted,
  onNameChange,
  onDesignComplete,
}: ConsultationWorkspaceProps) {
  const consultation = useConsultation(initial)
  const { stage, info } = consultation
  const done = status === 'done'

  // 부모 콜백은 렌더마다 새로 만들어지므로 ref로 최신 값만 참조한다
  const onNameChangeRef = useRef(onNameChange)
  useEffect(() => {
    onNameChangeRef.current = onNameChange
  })

  useEffect(() => {
    if (info.customer) onNameChangeRef.current(info.customer)
  }, [info.customer])

  const handleStart = (text: string) => {
    onStarted()
    consultation.start(text)
  }

  // 완료된 의뢰는 설계 화면 대신 대화 기록을 보여준다
  const view = done ? 'chat' : stage

  return (
    <div className={[styles.workspace, !active && styles.hidden].filter(Boolean).join(' ')}>
      <main className={styles.main}>
        {view === 'start' && <StartView onStart={handleStart} />}
        {view === 'chat' && (
          <ChatView
            title={info.customer ?? '새 의뢰'}
            done={done}
            active={active}
            messages={consultation.messages}
            info={info}
            isAiTyping={consultation.isAiTyping}
            canType={consultation.canType}
            onSend={consultation.sendMessage}
            onConfirmChoice={consultation.confirmChoice}
            onCompleteConnect={consultation.completeConnect}
            onConfirmDesign={consultation.confirmDesign}
          />
        )}
        {view === 'designing' && <DesigningView onComplete={onDesignComplete} />}
      </main>
      {view === 'chat' && <InfoPanel info={info} />}
    </div>
  )
}
