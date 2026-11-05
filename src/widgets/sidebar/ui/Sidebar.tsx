import { useQuery } from '@tanstack/react-query'
import { NavLink, useNavigate } from 'react-router'
import { PROJECT_STAGE_LABEL, projectPath, projectQueries } from '@/entities/project'
import { useLogout } from '@/features/logout'
import { icons, images, logoutIcon } from '@/shared/ui'

export function Sidebar() {
  const navigate = useNavigate()
  const logout = useLogout()
  const { data: projects, isPending, isError, refetch } = useQuery(projectQueries.list())

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col gap-3 overflow-hidden rounded-xlarge bg-main-100 p-[30px]">
      <p className="m-0 text-[28px] leading-none font-bold text-white">Wayco</p>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="flex w-full items-center gap-2.5 rounded-small border-0 bg-white px-2.5 py-2 text-left text-sm font-medium text-gray-100"
      >
        <img src={icons.plus} alt="" width={22} height={22} />새 의뢰 시작
      </button>

      <img src={icons.divider} alt="" width={153} height={1} className="w-[152px]" />

      <nav aria-label="의뢰 목록" className="flex min-h-0 flex-col gap-3 overflow-y-auto">
        {isPending && (
          <p role="status" className="m-0 px-2.5 text-xs text-gray-30">
            의뢰 목록을 불러오는 중…
          </p>
        )}
        {isError && (
          <div role="alert" className="flex flex-col items-start gap-1.5 px-2.5">
            <p className="m-0 text-xs text-red-0">의뢰 목록을 불러오지 못했어요.</p>
            <button
              type="button"
              className="border-0 bg-transparent p-0 text-xs font-semibold text-white underline"
              onClick={() => void refetch()}
            >
              다시 시도
            </button>
          </div>
        )}
        {projects?.length === 0 && (
          <p role="status" className="m-0 px-2.5 text-xs text-gray-30">
            아직 등록된 의뢰가 없어요.
          </p>
        )}
        {projects?.map((project) => (
          <NavLink
            key={project.projectId}
            to={projectPath(project.projectId)}
            className={({ isActive }) =>
              `flex items-center justify-between gap-2 rounded-small px-2.5 py-2 no-underline ${
                isActive ? 'bg-main-80' : 'hover:bg-white/5'
              }`
            }
          >
            <span className="min-w-0 truncate text-sm font-medium text-white">
              {project.companyName}
            </span>
            <span
              className={`shrink-0 text-xs font-semibold ${
                project.stage === 'RECOMMENDED' ? 'text-gray-40' : 'text-[#5892ec]'
              }`}
            >
              {PROJECT_STAGE_LABEL[project.stage]}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 px-2.5 py-2">
        <img src={images.avatar} alt="" width={30} height={30} className="rounded-full" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
          MSP 엔지니어
        </span>
        <button
          type="button"
          aria-label="로그아웃"
          title="로그아웃"
          onClick={logout}
          className="shrink-0 border-0 bg-transparent p-1"
        >
          <img src={logoutIcon} alt="" width={17} height={15} />
        </button>
      </div>
    </aside>
  )
}
