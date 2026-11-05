import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AppSidebar } from '@/widgets/app-sidebar'
import { MOCK_DONE_CONSULTATIONS } from '../model/mockConsultations'
import type { Consultation } from '../model/types'
import { ConsultationWorkspace } from './ConsultationWorkspace'
import styles from './ConsultationPage.module.css'

const NEW_CONSULTATION_NAME = '새 의뢰'

let consultationSeq = 0
const createConsultation = (): Consultation => ({
  id: `new-${++consultationSeq}`,
  name: NEW_CONSULTATION_NAME,
  status: 'in-progress',
})

export function ConsultationPage() {
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState<Consultation[]>(() => [
    createConsultation(),
    ...MOCK_DONE_CONSULTATIONS,
  ])
  const [activeId, setActiveId] = useState(consultations[0].id)
  // 첫 메시지를 보낸 의뢰. 아직 시작 안 한 새 의뢰가 있으면 "새 의뢰 시작"이 그걸 재사용한다
  const [startedIds, setStartedIds] = useState<string[]>([])

  const update = (id: string, patch: Partial<Consultation>) => {
    setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  const startNewConsultation = () => {
    const unstarted = consultations.find(
      (c) => c.status === 'in-progress' && !c.initial && !startedIds.includes(c.id),
    )
    if (unstarted) {
      setActiveId(unstarted.id)
      return
    }
    const created = createConsultation()
    setConsultations((prev) => [created, ...prev])
    setActiveId(created.id)
  }

  return (
    <div className={styles.page}>
      <AppSidebar
        consultations={consultations}
        activeId={activeId}
        userName="testUser"
        onNewConsultation={startNewConsultation}
        onSelect={setActiveId}
        // 세션(토큰) 저장은 API 연결 때 붙이고, 지금은 로그인 화면으로만 보낸다
        onLogout={() => navigate('/login', { replace: true })}
      />
      {consultations.map((c) => (
        <ConsultationWorkspace
          key={c.id}
          active={c.id === activeId}
          status={c.status}
          initial={c.initial}
          onStarted={() => setStartedIds((prev) => [...prev, c.id])}
          onNameChange={(name) => update(c.id, { name })}
          onFinish={() => update(c.id, { status: 'done' })}
        />
      ))}
    </div>
  )
}
