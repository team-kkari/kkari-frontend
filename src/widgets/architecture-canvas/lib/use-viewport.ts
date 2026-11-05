import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const MIN_SCALE = 0.2
const MAX_SCALE = 3
const FIT_PADDING = 32
const DRAG_THRESHOLD = 3

interface View {
  scale: number
  x: number
  y: number
}

/** 캔버스 팬(드래그)·줌(휠/버튼)·화면 맞춤 */
export function useViewport(contentWidth: number, contentHeight: number) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 })
  /** 방금 드래그였으면 클릭(노드 선택)을 무시하기 위한 플래그 */
  const draggedRef = useRef(false)

  const fit = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const { clientWidth: cw, clientHeight: ch } = el
    const scale = Math.min(
      (cw - FIT_PADDING * 2) / contentWidth,
      (ch - FIT_PADDING * 2) / contentHeight,
      1.5,
    )
    setView({ scale, x: (cw - contentWidth * scale) / 2, y: (ch - contentHeight * scale) / 2 })
  }, [contentWidth, contentHeight])

  useLayoutEffect(() => {
    fit()
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [fit])

  /** (cx, cy) 지점을 고정한 채 확대/축소 */
  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setView((v) => {
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor))
      const ratio = scale / v.scale
      return { scale, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio }
    })
  }, [])

  const zoomBy = useCallback(
    (factor: number) => {
      const el = containerRef.current
      if (!el) return
      zoomAt(factor, el.clientWidth / 2, el.clientHeight / 2)
    },
    [zoomAt],
  )

  // 휠 줌: preventDefault 를 쓰려면 passive: false 리스너가 필요
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    const startX = e.clientX
    const startY = e.clientY
    let last = { x: startX, y: startY }
    draggedRef.current = false

    const onMove = (ev: PointerEvent) => {
      if (
        !draggedRef.current &&
        Math.hypot(ev.clientX - startX, ev.clientY - startY) < DRAG_THRESHOLD
      ) {
        return
      }
      draggedRef.current = true
      const dx = ev.clientX - last.x
      const dy = ev.clientY - last.y
      last = { x: ev.clientX, y: ev.clientY }
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }))
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  return { containerRef, view, fit, zoomBy, onPointerDown, draggedRef }
}
