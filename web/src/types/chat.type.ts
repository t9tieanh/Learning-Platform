export type SenderRole = 'student' | 'instructor'

export type ConversationListItem = {
    conversationId: string
    key: string
    peerId: string
    peerName: string
    peerAvatar: string
    lastMessage?: {
        _id: string
        content: string
        senderId: string
        senderRole: SenderRole
        createdAt: string
    } | null
    unreadCount: number
    lastMessageAt?: string
}

export type MessageItem = {
    _id: string
    conversationId: string
    senderId: string
    senderRole: SenderRole
    content: string
    type: 'text' | 'image' | 'file' | 'system'
    status: 'sent' | 'read'
    createdAt: string
    peerId?: string
}

export type CursorPage<T> = {
    items: T[]
    hasMore: boolean
    nextCursor: string | null
}
