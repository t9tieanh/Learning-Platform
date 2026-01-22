import type { LessonComment, CreateLessonCommentDto, UpdateLessonCommentDto } from '@/types/comment.type'
import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/useAuth.stores'
import commentService from '@/services/comment/comment.service'

export interface ReplyUI {
  id: string
  userId?: string
  author: string
  avatar: string
  content: string
  timestamp: string
  likes: number
}

export interface CommentUI {
  id: string
  userId?: string
  author: string
  avatar: string
  content: string
  timestamp: string
  likes: number
  replies: ReplyUI[]
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function mapLessonCommentToUIReply(c: LessonComment): ReplyUI {
  return {
    id: c.id,
    userId: c.userId,
    author: c.userName,
    avatar: c.userAvt,
    content: c.content,
    timestamp: formatTime(c.createdAt),
    likes: 0
  }
}

export function mapLessonCommentToUI(c: LessonComment): CommentUI {
  return {
    id: c.id,
    userId: c.userId,
    author: c.userName,
    avatar: c.userAvt,
    content: c.content,
    timestamp: formatTime(c.createdAt),
    likes: 0,
    replies: c.children.map(mapLessonCommentToUIReply)
  }
}

interface EditingTarget {
  id: string
  isReply: boolean
  parentId?: string
}

interface PendingDelete {
  id: string
  isReply: boolean
  parentId?: string
}

export interface QASectionHook {
  comments: CommentUI[]
  newComment: string
  setNewComment: (v: string) => void
  handleAddComment: () => Promise<void>
  isSubmitting: boolean
  error: string | null
  isLoading: boolean
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  replyContent: string
  setReplyContent: (v: string) => void
  handleAddReply: (commentId: string) => Promise<void>
  visibleCount: number
  handleLoadMore: () => void
  handleLike: (commentId: string, replyId?: string) => void
  askDelete: (id: string, isReply?: boolean, parentId?: string) => void
  confirmOpen: boolean
  setConfirmOpen: (open: boolean) => void
  confirmDelete: () => Promise<void>
  isDeleting: boolean
  editingTarget: EditingTarget | null
  editContent: string
  setEditContent: (v: string) => void
  startEdit: (id: string, isReply: boolean, currentContent: string, parentId?: string) => void
  cancelEdit: () => void
  saveEdit: () => Promise<void>
  isEditingSaving: boolean
  userId?: string
  getInitials: (name: string) => string
}

export function useQASection(lessonId: string): QASectionHook {
  const userId = useAuthStore((s) => s.data?.userId)
  const userName = useAuthStore((s) => s.data?.name || 'You')
  const userAvatar = useAuthStore((s) => s.data?.avatarUrl || '')

  const [comments, setComments] = useState<CommentUI[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [visibleCount, setVisibleCount] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isEditingSaving, setIsEditingSaving] = useState(false)

  const loadComments = useCallback(async () => {
    if (!lessonId) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await commentService.getLessonComments(lessonId)
      if (res.code === 200 && res.result) {
        setComments(res.result.map(mapLessonCommentToUI))
      } else {
        setError(res.message || 'Không thể tải bình luận')
      }
    } catch {
      setError('Không thể tải bình luận. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleAddComment = async () => {
    if (!newComment.trim() || !userId) return
    setIsSubmitting(true)
    setError(null)
    const optimistic: CommentUI = {
      id: Date.now().toString(),
      userId,
      author: userName,
      avatar: userAvatar,
      content: newComment,
      timestamp: 'Just now',
      likes: 0,
      replies: []
    }
    setComments((prev) => [optimistic, ...prev])
    const payload: CreateLessonCommentDto = { lessonId, parentId: null, userId, content: newComment }
    try {
      await commentService.createLessonComment(payload)
      loadComments()
    } catch {
      setError('Không thể gửi bình luận. Vui lòng thử lại.')
      setComments((prev) => prev.filter((c) => c !== optimistic))
    } finally {
      setIsSubmitting(false)
      setNewComment('')
    }
  }

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim() || !userId) return
    setIsSubmitting(true)
    setError(null)
    const reply: ReplyUI = {
      id: `${commentId}-${Date.now()}`,
      userId,
      author: userName,
      avatar: userAvatar,
      content: replyContent,
      timestamp: 'Just now',
      likes: 0
    }
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c)))
    const payload: CreateLessonCommentDto = { lessonId, parentId: commentId, userId, content: replyContent }
    try {
      await commentService.createLessonComment(payload)
      loadComments()
    } catch {
      setError('Không thể gửi trả lời. Vui lòng thử lại.')
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, replies: c.replies.filter((r) => r !== reply) } : c))
      )
    } finally {
      setIsSubmitting(false)
      setReplyContent('')
      setReplyingTo(null)
    }
  }

  const handleLike = (commentId: string, replyId?: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          if (replyId) {
            return {
              ...comment,
              replies: comment.replies.map((r) => (r.id === replyId ? { ...r, likes: r.likes + 1 } : r))
            }
          }
          return { ...comment, likes: comment.likes + 1 }
        }
        return comment
      })
    )
  }

  const handleLoadMore = () => setVisibleCount((prev) => prev + 2)

  const handleDelete = async (id: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments((prev) =>
        prev.map((c) => (c.id === parentId ? { ...c, replies: c.replies.filter((r) => r.id !== id) } : c))
      )
    } else {
      setComments((prev) => prev.filter((c) => c.id !== id))
    }
    try {
      await commentService.deleteLessonComment(id)
      loadComments()
    } catch {
      setError('Không thể xóa bình luận. Vui lòng thử lại.')
      loadComments()
    }
  }

  const askDelete = (id: string, isReply = false, parentId?: string) => {
    setPendingDelete({ id, isReply, parentId })
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    await handleDelete(pendingDelete.id, pendingDelete.isReply, pendingDelete.parentId)
    setIsDeleting(false)
    setConfirmOpen(false)
    setPendingDelete(null)
  }

  const startEdit = (id: string, isReply: boolean, currentContent: string, parentId?: string) => {
    setEditingTarget({ id, isReply, parentId })
    setEditContent(currentContent)
  }

  const cancelEdit = () => {
    setEditingTarget(null)
    setEditContent('')
  }

  const saveEdit = async () => {
    if (!editingTarget) return
    if (!editContent.trim()) return
    setIsEditingSaving(true)
    const { id, isReply, parentId } = editingTarget
    const payload: UpdateLessonCommentDto = { content: editContent }
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id && !isReply) return { ...c, content: editContent }
        if (isReply && c.id === parentId) {
          return { ...c, replies: c.replies.map((r) => (r.id === id ? { ...r, content: editContent } : r)) }
        }
        return c
      })
    )
    try {
      await commentService.updateLessonComment(id, payload)
    } catch {
      setError('Không thể chỉnh sửa. Vui lòng thử lại.')
      loadComments()
    } finally {
      setIsEditingSaving(false)
      cancelEdit()
    }
  }

  return {
    comments,
    newComment,
    setNewComment,
    handleAddComment,
    isSubmitting,
    error,
    isLoading,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    handleAddReply,
    visibleCount,
    handleLoadMore,
    handleLike,
    askDelete,
    confirmOpen,
    setConfirmOpen,
    confirmDelete,
    isDeleting,
    editingTarget,
    editContent,
    setEditContent,
    startEdit,
    cancelEdit,
    saveEdit,
    isEditingSaving,
    userId,
    getInitials
  }
}
