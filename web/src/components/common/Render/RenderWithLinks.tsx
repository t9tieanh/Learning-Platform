import React from 'react'

const renderWithLinks = (text: string) => {
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g
  const parts = text?.split(markdownLinkRegex)

  return parts?.map((part, i) => {
    if (i % 3 === 0) {
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const subParts = part.split(urlRegex)
      return subParts.map((subPart, subIdx) => {
        const isUrl = subPart.startsWith('http://') || subPart.startsWith('https://')
        if (isUrl) {
          return (
            <a
              key={`${i}-${subIdx}`}
              href={subPart}
              target='_blank'
              rel='noopener noreferrer'
              className='underline text-blue-600 hover:text-blue-700'
            >
              {subPart}
            </a>
          )
        }
        return <span key={`${i}-${subIdx}`}>{subPart}</span>
      })
    } else if (i % 3 === 1) {
      // Markdown link text (next part is URL)
      const url = parts[i + 1]
      return (
        <a
          key={i}
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='underline text-blue-600 hover:text-blue-700'
        >
          {part}
        </a>
      )
    } else {
      // URL part of markdown link (already handled)
      return null
    }
  })
}

interface RenderWithLinkProps {
  text: string
}

const RenderWithLink: React.FC<RenderWithLinkProps> = ({ text }) => {
  return <div className='whitespace-pre-wrap break-words'>{renderWithLinks(text)}</div>
}

export default RenderWithLink
