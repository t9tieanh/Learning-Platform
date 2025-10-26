import { useState, useEffect, useRef } from 'react'

interface SSEOptions {
  url: string
  /** If true, EventSource will be created with withCredentials=true */
  withCredentials?: boolean
  /** disable automatic EventSource creation (you can call connect manually) */
  disabled?: boolean
}

interface SSEHookResult<T> {
  data: T | null
  error: Error | null
  isConnected: boolean
  /** close the underlying EventSource connection */
  close: () => void
}

export function useSSE<T = any>(options: SSEOptions): SSEHookResult<T> {
  const { url, withCredentials = false, disabled = false } = options
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (disabled || !url) return

    // If an EventSource already exists for the same url, reuse it
    if (esRef.current) {
      // close previous before creating new one
      esRef.current.close()
      esRef.current = null
    }

    let mounted = true

    try {
      const es = new EventSource(url, { withCredentials })
      esRef.current = es

      es.onopen = () => {
        if (!mounted) return
        setIsConnected(true)
        setError(null)
      }

      es.onmessage = (evt: MessageEvent) => {
        if (!mounted) return
        const text = evt.data
        try {
          const parsed = JSON.parse(text) as T
          setData(parsed)
        } catch (e) {
          // If payload is plain text, set raw text as unknown cast
          setData(text as unknown as T)
        }
      }

      es.onerror = (evt) => {
        if (!mounted) return
        setIsConnected(false)
        setError(new Error('SSE connection error'))
        // EventSource will attempt to reconnect automatically in browsers
      }

      // cleanup on unmount or url change
      return () => {
        mounted = false
        if (esRef.current) {
          esRef.current.close()
          esRef.current = null
        }
        setIsConnected(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      setIsConnected(false)
    }
  }, [url, withCredentials, disabled])

  const close = () => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
      setIsConnected(false)
    }
  }

  return { data, error, isConnected, close }
}
