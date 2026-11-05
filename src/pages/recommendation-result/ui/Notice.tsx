import type { ReactNode } from 'react'

interface NoticeProps {
  /** 오류면 설명을 붉게 보여준다 */
  tone?: 'default' | 'error'
  title: string
  description?: string
  action?: ReactNode
}

/** 결과 영역 한가운데에 띄우는 로딩·오류·빈 상태 안내 */
export function Notice({ tone = 'default', title, description, action }: NoticeProps) {
  return (
    <div className="m-auto flex max-w-[420px] flex-col items-center gap-2 text-center leading-normal">
      <p className="m-0 text-base font-medium text-gray-100">{title}</p>
      {description && (
        <p
          role={tone === 'error' ? 'alert' : undefined}
          className={`m-0 text-sm ${tone === 'error' ? 'text-red-20' : 'text-gray-50'}`}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
