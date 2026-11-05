import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import { customerServiceQueries } from '@/entities/customer-service'
import { recommendationQueries } from '@/entities/recommendation'
import { userQueries } from '@/entities/user'
import { useLogout } from '@/features/logout'
import { CustomerSidebar } from '@/widgets/customer-sidebar'
import { Notice } from './Notice'
import { ResultContent } from './ResultContent'

/** 고객이 보는 내 서비스의 추천 결과 (읽기 전용) */
export function CustomerRecommendationResultPage() {
  const { serviceId: param = '' } = useParams()
  const serviceId = /^\d+$/.test(param) ? Number(param) : null
  const navigate = useNavigate()
  const logout = useLogout()
  const { data: me } = useQuery(userQueries.me())

  return (
    <div className="flex h-screen min-w-[1280px] gap-[30px] bg-canvas p-5">
      <CustomerSidebar
        activeServiceId={serviceId ?? undefined}
        userName={me?.name || '고객'}
        onNewService={() => navigate('/desk')}
        onSelectService={(id) => navigate('/desk', { state: { serviceId: id } })}
        onLogout={logout}
      />
      {serviceId === null ? (
        <Notice
          tone="error"
          title="잘못된 주소예요"
          description="서비스 번호를 확인할 수 없어요. 왼쪽 목록에서 서비스를 다시 골라 주세요."
        />
      ) : (
        <ServiceResult key={serviceId} serviceId={serviceId} />
      )}
    </div>
  )
}

function ServiceResult({ serviceId }: { serviceId: number }) {
  const result = useQuery(recommendationQueries.customerResult(serviceId))
  const service = useQuery(customerServiceQueries.detail(serviceId))

  return (
    <ResultContent
      result={result}
      notFound={{
        title: '아직 추천 결과가 없어요',
        description: '추천이 끝나면 여기에서 결과를 볼 수 있어요',
      }}
      empty={{
        title: '추천 후보가 아직 없어요',
        description: '담당 엔지니어가 결과를 다시 준비하고 있어요',
      }}
      title={service.data?.serviceName ?? '추천 아키텍처'}
      priority=""
    />
  )
}
