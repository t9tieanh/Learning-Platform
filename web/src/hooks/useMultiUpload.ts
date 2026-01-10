/* eslint-disable no-constant-condition */
/* eslint-disable no-empty */
// ...existing code...
import { useCallback, useEffect, useRef, useState } from 'react'

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error' | 'cancelled'

export type MultiUploadItem = {
  id: string
  fileName: string
  progress: number // 0..100
  message: string
  title?: string
  status: UploadStatus
}

interface MultiUploadOptions {
  accessToken?: string
  baseUrl?: string // optional base API url, defaults to http://localhost:8888/api/v1
  callback?: () => Promise<void>
}

interface MultiUploadResult {
  uploads: MultiUploadItem[]
  startUpload: (file: File, fd: FormData, titlePost: string, uri: string) => string // returns upload id
  cancelUpload: (id: string) => void
  removeUpload: (id: string) => void
  clearAll: () => void
}

/**
 * useMultiUpload
 * - manage multiple concurrent uploads
 * - each upload returns SSE-like progress parsed from response stream
 * - startUpload returns an id for tracking / cancelling
 */
export function useMultiUpload({
  accessToken,
  baseUrl = (import.meta.env.VITE_BACKEND_URI as string) || 'http://localhost:8888/api/v1/',
  callback
}: MultiUploadOptions): MultiUploadResult {
  const [uploads, setUploads] = useState<MultiUploadItem[]>([])
  const controllersRef = useRef<Record<string, AbortController | null>>({})
  // use Uint8Array reader (resp.body.getReader())
  const readersRef = useRef<Record<string, ReadableStreamDefaultReader<Uint8Array> | null>>({})

  const upsert = useCallback((id: string, patch: Partial<MultiUploadItem>) => {
    setUploads((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      if (idx === -1) {
        const item: MultiUploadItem = {
          id,
          fileName: patch.fileName ?? 'unknown',
          progress: patch.progress ?? 0,
          message: patch.message ?? '',
          status: patch.status ?? 'idle',
          title: patch.title ?? ''
        }
        return [item, ...prev]
      }
      const next = [...prev]
      next[idx] = { ...next[idx], ...patch }
      return next
    })
  }, [])

  const removeUpload = useCallback((id: string) => {
    const ctrl = controllersRef.current[id]
    if (ctrl) {
      try {
        ctrl.abort()
      } catch {}
      controllersRef.current[id] = null
    }
    const rdr = readersRef.current[id]
    if (rdr) {
      try {
        rdr.cancel()
      } catch {}
      readersRef.current[id] = null
    }
    setUploads((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    Object.values(controllersRef.current).forEach((c) => {
      try {
        c?.abort()
      } catch {}
    })
    controllersRef.current = {}
    readersRef.current = {}
    setUploads([])
  }, [])

  const cancelUpload = useCallback(
    (id: string) => {
      const ctrl = controllersRef.current[id]
      if (ctrl) {
        try {
          ctrl.abort()
        } catch {}
        controllersRef.current[id] = null
      }
      const rdr = readersRef.current[id]
      if (rdr) {
        try {
          rdr.cancel()
        } catch {}
        readersRef.current[id] = null
      }
      upsert(id, { status: 'cancelled', message: 'Cancelled by user' })
    },
    [upsert]
  )

  const startUpload = useCallback(
    (file: File, fd: FormData, titlePost: string, uri: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      upsert(id, {
        id,
        fileName: file.name,
        progress: 0,
        message: 'Tài liệu đang được tải lên...',
        status: 'uploading',
        title: titlePost
      })

      const controller = new AbortController()
      controllersRef.current[id] = controller

      const url = `${baseUrl.replace(/\/$/, '')}${uri.replace(/^\//, '')}`

      ;(async () => {
        // const fd = new FormData()
        fd.append('file', file)
        // fd.append('lesson', new Blob([JSON.stringify(meta)], { type: 'application/json' }))

        try {
          const headers: Record<string, string> = {}
          if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

          const resp = await fetch(url, {
            method: 'POST',
            headers,
            body: fd,
            signal: controller.signal
          })

          if (!resp.ok || !resp.body) {
            upsert(id, {
              status: 'error',
              message: `Đã có lỗi trong quá trình tải lên: ${resp.statusText || resp.status}`
            })
            return
          }

          // use reader + TextDecoder to avoid TextDecoderStream typing issues
          const reader = resp.body.getReader()
          readersRef.current[id] = reader
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            if (value) {
              // value is Uint8Array
              const chunkText = decoder.decode(value, { stream: true })
              buffer += chunkText
              const events = buffer.split('\n\n')
              for (let i = 0; i < events.length - 1; i++) {
                const block = events[i].trim()
                if (!block) continue
                const lines = block.split('\n')
                const dataLine = lines.find((l) => l.startsWith('data:'))
                const eventLine = lines.find((l) => l.startsWith('event:'))
                if (!dataLine) continue
                const ev = eventLine ? eventLine.replace('event:', '').trim() : 'message'
                const jsonStr = dataLine.replace('data:', '').trim()
                try {
                  const parsed = JSON.parse(jsonStr)
                  if (ev === 'uploading' && typeof parsed.progress === 'number') {
                    const p = Math.round(parsed.progress * 100)
                    upsert(id, { progress: p, message: `Tài liệu đang được tải lên...(${p}%)` })
                  } else if (ev === 'saving_db') {
                    upsert(id, { message: parsed.message ?? '' })
                  } else if (ev === 'completed') {
                    upsert(id, { message: parsed.message ?? '', progress: 100, status: 'done' })
                  } else {
                    if (parsed.message) upsert(id, { message: parsed.message })
                  }
                } catch (err) {
                  console.warn('SSE parse error', err)
                }
              }
              buffer = events[events.length - 1]
            }
          }

          // finalize
          setUploads((prev) => prev.map((it) => (it.id === id ? { ...it, status: 'done', progress: 100 } : it)))
        } catch (err: any) {
          if (err?.name === 'AbortError') {
            upsert(id, { status: 'cancelled', message: 'Cancelled' })
          } else {
            console.error(err)
            upsert(id, { status: 'error', message: err?.message ?? 'Có lỗi trong quá trình upload' })
          }
        } finally {
          controllersRef.current[id] = null
          const rdr = readersRef.current[id]
          if (rdr) {
            try {
              rdr.cancel()
            } catch {}
            readersRef.current[id] = null
          }
          // call callback after upload finished
          if (callback && typeof callback === 'function') {
            try {
              await callback()
            } catch (e) {
              console.error('Callback error after upload:', e)
            }
          }
        }
      })()

      return id
    },
    [accessToken, baseUrl, upsert]
  )

  useEffect(() => {
    return () => {
      Object.values(controllersRef.current).forEach((c) => {
        try {
          c?.abort()
        } catch {}
      })
      Object.values(readersRef.current).forEach((r) => {
        try {
          r?.cancel()
        } catch {}
      })
    }
  }, [])

  return { uploads, startUpload, cancelUpload, removeUpload, clearAll }
}

export default useMultiUpload
