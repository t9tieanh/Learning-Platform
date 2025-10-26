import { Router } from 'express'
import { ValidateDto } from '~/middleware'
import ChatController from '../controllers/chat.controller'
import {
    CreateDirectConversationDTO,
    GetMessagesDTO,
    SendMessageDTO,
    ReadMessageDTO
} from '../dto/request/chat.dto'

const router = Router()

// Tạo/tìm cuộc trò chuyện 1-1 giữa user hiện tại và peerId
router.post('/conversations/direct', ValidateDto(CreateDirectConversationDTO), ChatController.createOrGetDirect)

// Lấy danh sách cuộc trò chuyện của user hiện tại
router.get('/conversations', ChatController.listConversations)

// Lấy lịch sử tin nhắn theo conversationId (cursor based)
router.get('/messages', ValidateDto(GetMessagesDTO), ChatController.getMessages)

// Gửi tin nhắn trong một cuộc trò chuyện
router.post('/messages', ValidateDto(SendMessageDTO), ChatController.sendMessage)

// Đánh dấu đã đọc tin nhắn (toàn bộ hoặc đến một messageId)
router.post('/messages/read', ValidateDto(ReadMessageDTO), ChatController.markRead)

export default router
