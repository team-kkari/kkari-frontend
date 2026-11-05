import { Fragment, type ReactNode } from 'react'

const BOLD = /\*\*([^*\n]+?)\*\*/g

interface BoldTextProps {
  children: string
}

/**
 * AI 답변의 `**굵게**` 만 굵은 글씨로 보여 주고, 나머지는 글자 그대로 둔다.
 * 마크다운 전체를 해석하지 않고 HTML 도 만들지 않아서, 어떤 문자열이 와도 태그로 해석되지 않는다
 */
export function BoldText({ children }: BoldTextProps) {
  const nodes: ReactNode[] = []
  let last = 0
  for (const match of children.matchAll(BOLD)) {
    if (match.index > last) nodes.push(children.slice(last, match.index))
    nodes.push(<strong key={match.index}>{match[1]}</strong>)
    last = match.index + match[0].length
  }
  if (last < children.length) nodes.push(children.slice(last))
  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </>
  )
}
