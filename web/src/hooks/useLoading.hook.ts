import { useState, useCallback } from 'react'

const useLoading = () => {
  const [loading, setLoading] = useState(false)

  const startLoading = useCallback(() => setLoading(true), [])
  const stopLoading = useCallback(() => setLoading(false), [])

  return { loading, startLoading, stopLoading }
}

export default useLoading
