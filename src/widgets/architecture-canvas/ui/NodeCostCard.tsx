import type { CostItem, DiagramNode } from '@/entities/recommendation'
import { icons } from '@/shared/ui'

interface NodeCostCardProps {
  node: DiagramNode
  cost?: CostItem
  onClose: () => void
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function NodeCostCard({ node, cost, onClose }: NodeCostCardProps) {
  return (
    <div className="absolute top-4 left-4 flex w-[300px] flex-col gap-2 rounded-medium border border-gray-10 bg-white px-4 py-3 shadow-[0_4px_16px_rgba(16,18,20,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 leading-normal">
          <span className="text-sm font-semibold text-gray-100">{node.label}</span>
          {node.role && <span className="text-xs text-gray-50">{node.role}</span>}
        </div>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="shrink-0 border-0 bg-transparent p-0"
        >
          <img src={icons.close} alt="" width={20} height={20} />
        </button>
      </div>
      {cost && (
        <div className="flex flex-col gap-1 rounded-small bg-gray-0 px-3 py-2 leading-normal">
          <span className="text-xs font-medium text-gray-50">월 예상 비용</span>
          <span className="text-base font-semibold text-gray-100">
            {cost.monthlyUsd === null ? '추정 불가' : usd.format(cost.monthlyUsd)}
          </span>
          <span className="text-xs break-keep text-gray-50">{cost.formula}</span>
        </div>
      )}
    </div>
  )
}
