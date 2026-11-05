import awsCloud from './assets/icons/aws-cloud.svg'
import btnNext from './assets/icons/btn-next.svg'
import btnPrev from './assets/icons/btn-prev.svg'
import chevronDown from './assets/icons/chevron-down.svg'
import chevronUp from './assets/icons/chevron-up.svg'
import dotOff from './assets/icons/dot-off.svg'
import dotOn from './assets/icons/dot-on.svg'
import iconClose from './assets/icons/icon-close.svg'
import iconCompare from './assets/icons/icon-compare.svg'
import iconFocus from './assets/icons/icon-focus.svg'
import iconSparkle from './assets/icons/icon-sparkle.svg'
import iconZoomIn from './assets/icons/icon-zoom-in.svg'
import iconZoomOut from './assets/icons/icon-zoom-out.svg'

export const icons = {
  awsCloud,
  btnNext,
  btnPrev,
  chevronDown,
  chevronUp,
  dotOff,
  dotOn,
  close: iconClose,
  compare: iconCompare,
  focus: iconFocus,
  sparkle: iconSparkle,
  zoomIn: iconZoomIn,
  zoomOut: iconZoomOut,
} as const

/**
 * AWS 공식 Architecture Icons (Asset-Package 2025-07-31) 중 다이어그램에 쓰는 것만.
 * 파일 이름 = AI 응답의 node.icon 키 (예: route53, alb, rds)
 * 새 서비스가 나오면 같은 규칙으로 assets/aws/<키>.svg 를 추가하면 된다.
 */
const awsIconModules = import.meta.glob<string>('./assets/aws/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const awsIcons: Record<string, string> = Object.fromEntries(
  Object.entries(awsIconModules).map(([path, url]) => [
    path.slice(path.lastIndexOf('/') + 1, -'.svg'.length),
    url,
  ]),
)
