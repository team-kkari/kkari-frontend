import type { DiagramBox } from '@/entities/recommendation'
import { icons } from '@/shared/ui'

interface BoxStyle {
  stroke: string
  fill: string
  dashed: boolean
  labelColor: string
}

const AWS_DARK = '#232F3E'
const GRAY = '#8D98A5'

function getBoxStyle(box: DiagramBox): BoxStyle {
  switch (box.kind) {
    case 'cloud':
      return { stroke: AWS_DARK, fill: '#FFFFFF', dashed: false, labelColor: AWS_DARK }
    case 'edge_band':
    case 'region_band':
      return { stroke: GRAY, fill: 'none', dashed: true, labelColor: '#707E8F' }
    case 'vpc':
      return { stroke: '#8C4FFF', fill: 'none', dashed: false, labelColor: '#8C4FFF' }
    case 'az':
      return { stroke: '#147EBA', fill: 'none', dashed: true, labelColor: '#147EBA' }
    case 'subnet':
      return box.style === 'public'
        ? { stroke: 'none', fill: '#F2F6E8', dashed: false, labelColor: '#248814' }
        : { stroke: 'none', fill: '#E6F2F8', dashed: false, labelColor: '#147EBA' }
    case 'group':
      return box.style === 'auto_scaling'
        ? { stroke: '#ED7100', fill: 'none', dashed: true, labelColor: '#ED7100' }
        : { stroke: '#C925D1', fill: 'none', dashed: true, labelColor: '#C925D1' }
    default:
      return { stroke: GRAY, fill: 'none', dashed: true, labelColor: '#707E8F' }
  }
}

export function DiagramBoxShape({ box }: { box: DiagramBox }) {
  const s = getBoxStyle(box)
  const isCloud = box.kind === 'cloud'
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={box.kind === 'subnet' || box.kind === 'group' ? 6 : 2}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={isCloud ? 1.5 : 1.2}
        strokeDasharray={s.dashed ? '6 4' : undefined}
      />
      {isCloud && <image href={icons.awsCloud} x={box.x} y={box.y} width={32} height={32} />}
      <text
        x={box.x + (isCloud ? 40 : 10)}
        y={box.y + (isCloud ? 21 : 19)}
        fontSize={14}
        fontWeight={600}
        fill={s.labelColor}
      >
        {box.label}
      </text>
    </g>
  )
}
