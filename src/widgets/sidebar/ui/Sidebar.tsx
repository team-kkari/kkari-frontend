import { useQuery } from '@tanstack/react-query'
import { Link, NavLink, useNavigate } from 'react-router'
import { REQUEST_STATUS_LABEL, requestQueries } from '@/entities/request'
import { icons, images } from '@/shared/ui'

export function Sidebar() {
  const navigate = useNavigate()
  const { data: requests = [] } = useQuery(requestQueries.list())

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col gap-3 overflow-hidden rounded-xlarge bg-main-100 p-[30px]">
      <Link
        to="/"
        aria-label="Wayco 홈으로"
        className="self-start text-[28px] leading-none font-bold text-white no-underline"
      >
        Wayco
      </Link>

      {/* 의뢰 화면(/)은 열릴 때 새 의뢰가 선택된 상태로 시작한다 */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex w-full items-center gap-2.5 rounded-small border-0 bg-white px-2.5 py-2 text-left text-sm font-medium text-gray-100 hover:bg-gray-10"
      >
        <img src={icons.plus} alt="" width={22} height={22} />새 의뢰 시작
      </button>

      <img src={icons.divider} alt="" width={153} height={1} className="w-[152px]" />

      <nav className="flex flex-col gap-3">
        {requests.map((req) => (
          <NavLink
            key={req.id}
            to={`/requests/${req.id}`}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-small px-2.5 py-2 no-underline ${
                isActive ? 'bg-main-80' : 'hover:bg-white/5'
              }`
            }
          >
            <span className="text-sm font-medium text-white">{req.title}</span>
            <span
              className={`text-xs font-semibold ${
                req.status === 'in_progress' ? 'text-[#5892ec]' : 'text-gray-40'
              }`}
            >
              {REQUEST_STATUS_LABEL[req.status]}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 px-2.5 py-2">
        <img src={images.avatar} alt="" width={30} height={30} className="rounded-full" />
        <span className="text-sm font-semibold text-white">testUser</span>
      </div>
    </aside>
  )
}
