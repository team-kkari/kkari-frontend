import { useState } from 'react'
import type { CostItem, DiagramLayout } from '@/entities/recommendation'
import { icons } from '@/shared/ui'
import { useViewport } from '../lib/use-viewport'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { NodeCostCard } from './NodeCostCard'

interface ArchitectureCanvasProps {
  layout: DiagramLayout
  costItems: CostItem[]
  candidateCount: number
  onCompare: () => void
}

const ZOOM_STEP = 1.25

function ToolButton({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-small border border-gray-10 bg-white p-0 hover:bg-gray-0"
    >
      <img src={icon} alt="" width={18} height={18} />
    </button>
  )
}

export function ArchitectureCanvas({
  layout,
  costItems,
  candidateCount,
  onCompare,
}: ArchitectureCanvasProps) {
  const { containerRef, view, fit, zoomBy, onPointerDown, draggedRef } = useViewport(
    layout.width,
    layout.height,
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedNode = layout.nodes.find((n) => n.id === selectedId)

  return (
    <section className="relative min-h-0 w-full flex-1 overflow-hidden rounded-large bg-white">
      <div
        ref={containerRef}
        className="size-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onClickCapture={(e) => {
          // 드래그 직후의 클릭은 선택/해제로 치지 않음
          if (draggedRef.current) {
            e.stopPropagation()
            draggedRef.current = false
          }
        }}
        onClick={() => setSelectedId(null)}
      >
        <div
          className="origin-top-left"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        >
          <ArchitectureDiagram
            layout={layout}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
          />
        </div>
      </div>

      {selectedNode && (
        <NodeCostCard
          node={selectedNode}
          cost={costItems.find((c) => c.nodeId === selectedNode.nodeId)}
          onClose={() => setSelectedId(null)}
        />
      )}

      <button
        type="button"
        onClick={onCompare}
        className="absolute top-4 right-4 flex items-center gap-1.5 rounded-small border border-gray-10 bg-white py-2 pr-3.5 pl-3 text-sm leading-normal font-medium text-main-60 hover:bg-gray-0"
      >
        <img src={icons.compare} alt="" width={18} height={18} />
        {candidateCount}개 비교
      </button>

      <div className="absolute right-4 bottom-4 flex flex-col gap-1.5">
        <ToolButton icon={icons.zoomIn} label="확대" onClick={() => zoomBy(ZOOM_STEP)} />
        <ToolButton icon={icons.zoomOut} label="축소" onClick={() => zoomBy(1 / ZOOM_STEP)} />
        <ToolButton icon={icons.focus} label="화면에 맞추기" onClick={fit} />
      </div>
    </section>
  )
}
