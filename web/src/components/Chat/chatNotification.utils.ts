import type { NavigateFunction } from 'react-router-dom'
import type { ConversationListItem } from '@/types/chat.type'
import { showChatNotificationToast } from '@/components/Chat/showChatNotificationToast'

const STORAGE_KEY = 'chat_notified_message_ids'
const RECENT_NOTIFICATION_MS = 10 * 60 * 1000

function getNotifiedMessageIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function markMessageNotified(messageId: string) {
  const ids = getNotifiedMessageIds()
  ids.add(messageId)
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids].slice(-100)))
}

export function shouldNotifyMessage(messageId?: string | null): messageId is string {
  if (!messageId) return false
  return !getNotifiedMessageIds().has(messageId)
}

export function getChatNavigation(
  myId: string,
  instructorId?: string,
  studentId?: string,
  pathname?: string
) {
  const isInstructorSide =
    myId === instructorId ||
    (!!pathname && pathname.startsWith('/teacher') && myId !== studentId)
  const peerId = isInstructorSide ? studentId : instructorId
  const chatBase = isInstructorSide ? '/teacher/chat' : '/chat'

  return { isInstructorSide, peerId, chatBase }
}

function truncateMessage(message: string, maxLength = 120) {
  if (message.length <= maxLength) return message
  return `${message.slice(0, maxLength).trim()}…`
}

function isViewingConversation(
  pathname: string,
  activePeerId: string | undefined,
  peerId: string | undefined,
  isInstructorSide: boolean
) {
  return (
    Boolean(peerId) &&
    activePeerId === peerId &&
    ((isInstructorSide && pathname.startsWith('/teacher/chat')) ||
      (!isInstructorSide && pathname.startsWith('/chat/')))
  )
}

type NotifyChatMessageParams = {
  myId: string
  messageId?: string
  senderId: string
  message: string
  instructorId?: string
  studentId?: string
  pathname: string
  activePeerId?: string
  navigate: NavigateFunction
  title?: string
  avatar?: string
  recentOnly?: boolean
  createdAt?: string | number
}

export function notifyChatMessage({
  myId,
  messageId,
  senderId,
  message,
  instructorId,
  studentId,
  pathname,
  activePeerId,
  navigate,
  title,
  avatar,
  recentOnly = false,
  createdAt
}: NotifyChatMessageParams): boolean {
  if (!senderId || senderId === myId) return false
  if (messageId && !shouldNotifyMessage(messageId)) return false

  if (recentOnly && createdAt) {
    const createdMs = typeof createdAt === 'number' ? createdAt : new Date(createdAt).getTime()
    if (Number.isNaN(createdMs) || Date.now() - createdMs > RECENT_NOTIFICATION_MS) {
      return false
    }
  }

  const { isInstructorSide, peerId, chatBase } = getChatNavigation(myId, instructorId, studentId, pathname)
  if (isViewingConversation(pathname, activePeerId, peerId, isInstructorSide)) return false

  const resolvedTitle = title || (isInstructorSide ? 'Học viên' : 'Giảng viên')
  const openChat = () => {
    if (peerId) navigate(`${chatBase}/${peerId}`)
    else navigate(chatBase)
  }

  if (messageId) markMessageNotified(messageId)

  showChatNotificationToast({
    title: resolvedTitle,
    message: truncateMessage(message),
    avatar,
    onOpen: openChat
  })

  return true
}

export function notifyUnreadConversation(
  conversation: ConversationListItem,
  params: Omit<NotifyChatMessageParams, 'messageId' | 'senderId' | 'message' | 'instructorId' | 'studentId' | 'createdAt'> & {
    instructorId?: string
    studentId?: string
  }
): boolean {
  const lastMessage = conversation.lastMessage
  if (!lastMessage || conversation.unreadCount <= 0) return false

  return notifyChatMessage({
    ...params,
    messageId: lastMessage._id,
    senderId: lastMessage.senderId,
    message: lastMessage.content,
    instructorId:
      params.instructorId ??
      (lastMessage.senderRole === 'instructor' ? lastMessage.senderId : conversation.peerId),
    studentId:
      params.studentId ??
      (lastMessage.senderRole === 'student' ? lastMessage.senderId : conversation.peerId),
    title: conversation.peerName || params.title,
    avatar: conversation.peerAvatar,
    createdAt: lastMessage.createdAt,
    recentOnly: true
  })
}
