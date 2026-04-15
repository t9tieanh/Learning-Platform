export const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return '0 phút'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) return `${mins} phút`
  return `${mins} phút ${secs}s`
}

export const timeToSeconds = (timeStr: string | null) => {
  if (!timeStr) return 0
  const cleanTime = timeStr.trim().replace(',', '.')
  const parts = cleanTime.split(':').map(parseFloat)

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return isNaN(parts[0]) ? 0 : parts[0]
}

export const formatVideoTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
