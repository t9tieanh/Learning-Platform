/* eslint-disable no-constant-condition */
import { useState, useCallback } from 'react'

interface UploadOptions {
  accessToken: string
  uri: string
}

interface UploadResult {
  upload: (formData: FormData, callback?: () => Promise<void>) => Promise<void>
  progress: number
  message: string
  isUploading: boolean
}

export function useUpload({ accessToken, uri }: UploadOptions): UploadResult {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const upload = useCallback(
    async (formData: FormData, callback?: () => Promise<void>) => {
      if (!formData.get('file')) {
        throw new Error('Vui lòng chọn file trước khi lưu bài giảng')
      }

      setProgress(0)
      setMessage('')
      setIsUploading(true)

      try {
        const response = await fetch(`http://localhost:8888/api/v1/${uri}`, {
          method: 'POST',
          headers: {
            Authorization: accessToken ? 'Bearer ' + accessToken : ''
          },
          body: formData
        })

        if (!response.ok || !response.body) {
          throw new Error('Upload failed')
        }

        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += value
          const events = buffer.split('\n\n') // SSE events cách nhau 2 dòng trống

          for (let i = 0; i < events.length - 1; i++) {
            const eventBlock = events[i].trim()
            if (!eventBlock) continue

            const lines = eventBlock.split('\n')
            const dataLine = lines.find((l) => l.startsWith('data:'))
            const eventLine = lines.find((l) => l.startsWith('event:'))

            if (dataLine) {
              const event = eventLine ? eventLine.replace('event:', '').trim() : 'message'
              const jsonStr = dataLine.replace('data:', '').trim()

              try {
                const parsed = JSON.parse(jsonStr)

                if (event === 'uploading') {
                  setProgress(Math.round(parsed.progress * 100))
                } else if (event === 'saving_db') {
                  setMessage(parsed.message)
                } else if (event === 'completed') {
                  setMessage(parsed.message)
                  setProgress(100)
                }
              } catch {
                console.warn('Không parse được:', jsonStr)
              }
            }
          }

          buffer = events[events.length - 1]
        }
        // finish upload -> call callback
        if (callback) await callback()
      } catch (err) {
        console.error(err)
        setMessage('Lỗi khi upload')
      } finally {
        setIsUploading(false)
      }
    },
    [accessToken, uri]
  )

  return { upload, progress, message, isUploading }
}
