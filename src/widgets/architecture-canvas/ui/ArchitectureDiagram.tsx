import { useMemo, useState } from 'react'
import type { DiagramLayout } from '@/entities/recommendation'
import { edgePath } from '../lib/edge-path'
import { DiagramBoxShape } from './DiagramBoxShape'
import { DiagramNodeShape } from './DiagramNodeShape'

interface ArchitectureDiagramProps {
  layout: DiagramLayout
  selectedId: string | null
  onSelect: (id: string) => void
}

const EDGE_COLOR = '#8D98A5'
const EDGE_ACTIVE = 'var(--color-main-60)'

/** AI 가 계산한 layout(좌표)을 그대로 SVG 로 그린다 */
export function ArchitectureDiagram({ layout, selectedId, onSelect }: ArchitectureDiagramProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const focusId = hoveredId ?? selectedId

  const nodeById = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout.nodes])

  const edges = useMemo(
    () =>
      layout.edges.flatMap((edge, i) => {
        const s = nodeById.get(edge.source)
        const t = nodeById.get(edge.target)
        if (!s || !t) return []
        return [{ ...edge, key: `${edge.source}-${edge.target}-${i}`, ...edgePath(s, t) }]
      }),
    [layout.edges, nodeById],
  )

  const connected = useMemo(() => {
    if (!focusId) return null
    const ids = new Set([focusId])
    for (const e of layout.edges) {
      if (e.source === focusId) ids.add(e.target)
      if (e.target === focusId) ids.add(e.source)
    }
    return ids
  }, [focusId, layout.edges])

  return (
    <svg
      width={layout.width}
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className="block select-none"
    >
      <defs>
        {[
          ['arrow', EDGE_COLOR],
          ['arrow-active', EDGE_ACTIVE],
        ].map(([id, color]) => (
          <marker
            key={id}
            id={id}
            viewBox="0 0 10 10"
            refX={9}
            refY={5}
            markerWidth={7}
            markerHeight={7}
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10Z" fill={color} />
          </marker>
        ))}
      </defs>

      {layout.boxes.map((box) => (
        <DiagramBoxShape key={box.id} box={box} />
      ))}

      {edges.map((edge) => {
        const active = !!focusId && (edge.source === focusId || edge.target === focusId)
        const dimmed = !!focusId && !active
        return (
          <g key={edge.key} opacity={dimmed ? 0.2 : 1} className="transition-opacity">
            <path
              d={edge.d}
              fill="none"
              stroke={active ? EDGE_ACTIVE : EDGE_COLOR}
              strokeWidth={active ? 2.2 : 1.5}
              markerEnd={`url(#${active ? 'arrow-active' : 'arrow'})`}
            />
            {/* 라벨은 겹치기 쉬워서, 선택·호버한 노드에 연결된 선에만 보여준다 */}
            {active && edge.label && (
              <foreignObject
                x={edge.labelAt.x - 90}
                y={edge.labelAt.y - 11}
                width={180}
                height={22}
              >
                <div className="flex h-full items-center justify-center">
                  <span className="rounded-sm bg-white px-1 py-0.5 text-[11px] leading-none font-medium whitespace-nowrap text-main-60 shadow-[0_0_0_1px_var(--color-main-10)]">
                    {edge.label}
                  </span>
                </div>
              </foreignObject>
            )}
          </g>
        )
      })}

      {layout.nodes.map((node) => (
        <DiagramNodeShape
          key={node.id}
          node={node}
          selected={node.id === selectedId}
          dimmed={!!connected && !connected.has(node.id)}
          onSelect={() => onSelect(node.id)}
          onHover={(hovered) => setHoveredId(hovered ? node.id : null)}
        />
      ))}
    </svg>
  )
}
