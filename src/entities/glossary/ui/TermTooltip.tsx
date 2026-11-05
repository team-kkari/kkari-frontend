import { useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { GlossaryTerm } from '../model/terms'

const TOOLTIP_WIDTH = 280
const GAP = 6
const EDGE = 12

interface TermTooltipProps {
  term: GlossaryTerm
  children: ReactNode
}

/**
 * 용어에 마우스를 올리거나(키보드 포커스 포함) 하면 뜻을 보여준다.
 * 스크롤 영역·캔버스의 overflow 에 잘리지 않도록 body 로 portal 렌더링.
 */
export function TermTooltip({ term, children }: TermTooltipProps) {
  const id = useId()
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean } | null>(null)

  const show = () => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (!rect) return
    const left = Math.min(
      Math.max(EDGE, rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2),
      window.innerWidth - TOOLTIP_WIDTH - EDGE,
    )
    // 화면 아래쪽이면 위로 띄움
    const above = rect.bottom > window.innerHeight - 140
    setPos({ left, top: above ? rect.top - GAP : rect.bottom + GAP, above })
  }
  const hide = () => setPos(null)

  return (
    <>
      <span
        ref={anchorRef}
        tabIndex={0}
        aria-describedby={pos ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="cursor-help rounded-sm underline decoration-main-50/60 decoration-dotted decoration-[1.5px] underline-offset-[3px] outline-none hover:bg-main-10 focus-visible:bg-main-10"
      >
        {children}
      </span>
      {pos &&
        createPortal(
          <div
            id={id}
            role="tooltip"
            className="pointer-events-none fixed z-[100] flex flex-col gap-1 rounded-small bg-gray-100 px-3 py-2.5 leading-normal shadow-lg"
            style={{
              left: pos.left,
              top: pos.top,
              width: TOOLTIP_WIDTH,
              transform: pos.above ? 'translateY(-100%)' : undefined,
            }}
          >
            <span className="text-[13px] font-semibold text-white">{term.title ?? term.term}</span>
            <span className="text-[13px] break-keep text-gray-10">{term.description}</span>
          </div>,
          document.body,
        )}
    </>
  )
}
