interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** 노드 아이콘 아래 라벨·역할 텍스트가 차지하는 높이 (선이 글자를 지나가지 않게) */
export const NODE_CAPTION_HEIGHT = 48

/**
 * 두 노드를 잇는 직각(ㄱ자) 경로.
 * 세로로 더 멀면 위/아래 변끼리, 가로로 더 멀면 좌/우 변끼리 연결한다.
 */
export function edgePath(s: Rect, t: Rect) {
  const sc = { x: s.x + s.w / 2, y: s.y + s.h / 2 }
  const tc = { x: t.x + t.w / 2, y: t.y + t.h / 2 }
  const dx = tc.x - sc.x
  const dy = tc.y - sc.y

  if (Math.abs(dy) >= Math.abs(dx)) {
    const sy = dy > 0 ? s.y + s.h + NODE_CAPTION_HEIGHT : s.y
    const ty = dy > 0 ? t.y : t.y + t.h + NODE_CAPTION_HEIGHT
    const my = (sy + ty) / 2
    return {
      d: `M${sc.x} ${sy}V${my}H${tc.x}V${ty}`,
      labelAt: { x: (sc.x + tc.x) / 2, y: my },
    }
  }

  const sx = dx > 0 ? s.x + s.w : s.x
  const tx = dx > 0 ? t.x : t.x + t.w
  const mx = (sx + tx) / 2
  return {
    d: `M${sx} ${sc.y}H${mx}V${tc.y}H${tx}`,
    labelAt: { x: mx, y: (sc.y + tc.y) / 2 },
  }
}
