import { GLOSSARY, type GlossaryTerm } from '../model/terms'

export type TextSegment = { text: string; term?: GlossaryTerm }

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const wordToTerm = new Map<string, GlossaryTerm>()
for (const term of GLOSSARY) {
  for (const word of [term.term, ...(term.aliases ?? [])]) wordToTerm.set(word, term)
}

// 긴 표기부터 매칭 ('Multi-AZ' 가 'AZ' 보다 먼저).
// 영문·숫자 단어 중간은 매칭하지 않음 ('COST' 안의 'OS', 'ARM64' 안의 'ARM' 방지)
const pattern = new RegExp(
  `(?<![A-Za-z0-9])(${[...wordToTerm.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join('|')})(?![A-Za-z0-9])`,
  'g',
)

/** 문장을 일반 텍스트와 용어 조각으로 나눈다 */
export function segmentText(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  let last = 0
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > last) segments.push({ text: text.slice(last, index) })
    segments.push({ text: match[0], term: wordToTerm.get(match[0]) })
    last = index + match[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last) })
  return segments
}

/** 다이어그램 node.icon 키로 용어 찾기 */
export function findTermByIcon(icon: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.icons?.includes(icon))
}
