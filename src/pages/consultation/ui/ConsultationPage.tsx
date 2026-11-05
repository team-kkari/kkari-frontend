import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { createProject, projectPath, projectQueries } from '@/entities/project'
import { useLogout } from '@/features/logout'
import { ApiError } from '@/shared/api'
import { AppSidebar } from '@/widgets/app-sidebar'
import { ConsultationWorkspace } from './ConsultationWorkspace'
import { StartView, type StartValues } from './StartView'
import styles from './ConsultationPage.module.css'

/** 라우트 `/` 는 새 의뢰 시작 화면, `/projects/:projectId` 는 그 의뢰의 상담 화면 */
export function ConsultationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useLogout()
  const { projectId: param } = useParams()
  const location = useLocation()
  const firstMessage = (location.state as { firstMessage?: string } | null)?.firstMessage
  const [startError, setStartError] = useState<string | null>(null)

  const projectId = param !== undefined && /^\d+$/.test(param) ? Number(param) : null

  const create = useMutation({
    mutationFn: ({ companyName, contactName }: StartValues) =>
      createProject({ companyName, contactName }),
    onSuccess: ({ projectId: createdId }, { message }) => {
      void queryClient.invalidateQueries({ queryKey: projectQueries.all() })
      navigate(projectPath(createdId), { state: { firstMessage: message } })
    },
    onError: (e) =>
      setStartError(
        e instanceof ApiError ? e.message : '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.',
      ),
  })

  return (
    <div className={styles.page}>
      <AppSidebar
        activeId={projectId ?? undefined}
        onNewConsultation={() => navigate('/')}
        onSelect={(id) => navigate(projectPath(id))}
        onLogout={logout}
      />
      {param === undefined ? (
        <StartView
          onStart={(values) => {
            setStartError(null)
            create.mutate(values)
          }}
          pending={create.isPending}
          error={startError}
        />
      ) : projectId === null ? (
        <p role="alert" className={styles.invalid}>
          잘못된 주소예요. 왼쪽 목록에서 의뢰를 골라 주세요.
        </p>
      ) : (
        // 의뢰가 바뀌면 상담 상태를 처음부터 새로 시작
        <ConsultationWorkspace key={projectId} projectId={projectId} firstMessage={firstMessage} />
      )}
    </div>
  )
}
