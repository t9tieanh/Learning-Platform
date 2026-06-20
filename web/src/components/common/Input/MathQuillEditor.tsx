import React, { useRef, useState, useEffect, forwardRef, useLayoutEffect } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// @ts-ignore
window.katex = katex

interface RichTextEditorProps {
  defaultValue?: any // legacy delta support
  initialHtml?: string // preferred: set initial HTML content
  readOnly?: boolean
  onChange?: (html: string) => void
  className?: string
}

const MathQuillEditor = forwardRef<Quill | null, RichTextEditorProps>(
  ({ defaultValue, initialHtml, readOnly = false, onChange, className }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const quillRef = useRef<Quill | null>(null)

    useLayoutEffect(() => {
      if (!containerRef.current) return

      const editorContainer = document.createElement('div')
      containerRef.current.appendChild(editorContainer)

      const quill = new Quill(editorContainer, {
        theme: 'snow',
        modules: {
          formula: true,
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['clean'],
            ['link', 'formula']
          ]
        }
      })

      quillRef.current = quill
      if (ref) {
        if (typeof ref === 'function') ref(quill)
        else ref.current = quill
      }

      if (initialHtml && typeof initialHtml === 'string') {
        quill.clipboard.dangerouslyPasteHTML(initialHtml)
        onChange?.(quill.root.innerHTML)
      } else if (defaultValue) {
        quill.setContents(defaultValue)
        onChange?.(quill.root.innerHTML)
      }

      quill.on('text-change', () => {
        onChange?.(quill.root.innerHTML)
      })

      return () => {
        containerRef.current!.innerHTML = ''
      }
    }, [])

    useEffect(() => {
      if (quillRef.current) {
        quillRef.current.enable(!readOnly)
      }
    }, [readOnly])

    useEffect(() => {
      const quill = quillRef.current
      if (!quill) return
      if (typeof initialHtml !== 'string') return
      const current = quill.root.innerHTML
      if (current.trim() !== initialHtml.trim()) {
        quill.setSelection(0, 0)
        quill.clipboard.dangerouslyPasteHTML(initialHtml)
        onChange?.(quill.root.innerHTML)
      }
    }, [initialHtml])

    return (
      <div className='border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm'>
        <div ref={containerRef} className={`${className ? className : 'min-h-[200px]'}`} />
      </div>
    )
  }
)

MathQuillEditor.displayName = 'MathQuillEditor'
export default MathQuillEditor
