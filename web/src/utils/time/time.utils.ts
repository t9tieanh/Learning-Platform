export const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return '0 phút'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (secs === 0) return `${mins} phút`
  return `${mins} phút ${secs}s`
}
