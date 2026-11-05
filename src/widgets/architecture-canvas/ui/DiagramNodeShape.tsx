import type { DiagramNode } from '@/entities/recommendation'
import { NODE_CAPTION_HEIGHT } from '../lib/edge-path'
import { getServiceIcon } from '../lib/service-icon'

const CAPTION_WIDTH = 150

interface DiagramNodeShapeProps {
  node: DiagramNode
  selected: boolean
  dimmed: boolean
  onSelect: () => void
  onHover: (hovered: boolean) => void
}

export function DiagramNodeShape({
  node,
  selected,
  dimmed,
  onSelect,
  onHover,
}: DiagramNodeShapeProps) {
  const icon = getServiceIcon(node.icon)

  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      opacity={dimmed ? 0.35 : 1}
      className="cursor-pointer transition-opacity"
      role="button"
      aria-label={`${node.label} ${node.role}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
    >
      {selected && (
        <rect
          x={-5}
          y={-5}
          width={node.w + 10}
          height={node.h + 10}
          rx={16}
          fill="none"
          stroke="var(--color-main-60)"
          strokeWidth={3}
        />
      )}
      {icon.type === 'image' ? (
        <>
          {/* 투명 배경 아이콘(리소스 아이콘)도 클릭·호버가 잡히도록 */}
          <rect width={node.w} height={node.h} fill="transparent" />
          <image href={icon.src} width={node.w} height={node.h} />
        </>
      ) : (
        <>
          <rect width={node.w} height={node.h} rx={12} fill={icon.color} />
          <text
            x={node.w / 2}
            y={node.h / 2}
            dominantBaseline="central"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize={icon.text.length > 3 ? 14 : icon.text.length > 2 ? 17 : 22}
            fontWeight={700}
          >
            {icon.text}
          </text>
        </>
      )}
      <foreignObject
        x={(node.w - CAPTION_WIDTH) / 2}
        y={node.h + 4}
        width={CAPTION_WIDTH}
        height={NODE_CAPTION_HEIGHT}
      >
        <div className="flex flex-col items-center text-center leading-tight">
          <span className="text-[13px] font-semibold text-gray-100">{node.label}</span>
          {node.role && <span className="text-[11px] text-gray-50">{node.role}</span>}
        </div>
      </foreignObject>
    </g>
  )
}
