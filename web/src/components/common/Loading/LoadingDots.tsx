import { useState, useEffect } from 'react'

interface LoadingDotsProps {
  text?: string
  className?: string
}

export const LoadingDots = ({ text = 'Đang tải', className = 'text-white text-sm font-medium' }: LoadingDotsProps) => {
  const [dotCount, setDotCount] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={className}>
      {text}
      {'.'.repeat(dotCount)}
    </span>
  )
}
