import { IsEnum, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateDirectConversationDTO {
  // userId của đối phương muốn chat (ObjectId dạng string)
  @IsString()
  @IsNotEmpty()
  peerId!: string
}

export class GetMessagesDTO {
  // conversationId cần lấy lịch sử
  @IsString()
  @IsNotEmpty()
  conversationId!: string

  // số lượng mỗi lần load (cursor-based)
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'limit must be a positive number' })
  limit?: number = 20

  // load các bản ghi có _id < cursor
  @IsOptional()
  @IsString()
  cursor?: string
}

export class SendMessageDTO {
  // hội thoại cần gửi
  @IsString()
  @IsNotEmpty()
  conversationId!: string

  // nội dung tin nhắn
  @IsString()
  @IsNotEmpty()
  content!: string

  // vai trò của người gửi (để FE render đúng)
  @IsEnum(['student', 'instructor'] as const, {
    message: 'senderRole must be either student or instructor'
  })
  senderRole!: 'student' | 'instructor'
}

export class ReadMessageDTO {
  // hội thoại cần đánh dấu đọc
  @IsString()
  @IsNotEmpty()
  conversationId!: string

  // nếu truyền messageId sẽ đánh dấu đọc tất cả tin nhắn có _id <= messageId
  @IsOptional()
  @IsString()
  messageId?: string
}

export class UpdateMessageDTO {
  // hội thoại chứa tin nhắn cần chỉnh sửa
  @IsString()
  @IsNotEmpty()
  conversationId!: string

  // id tin nhắn cần chỉnh sửa
  @IsString()
  @IsNotEmpty()
  messageId!: string

  // nội dung mới
  @IsString()
  @IsNotEmpty()
  content!: string
}

export class DeleteMessageDTO {
  // hội thoại chứa tin nhắn cần xóa
  @IsString()
  @IsNotEmpty()
  conversationId!: string

  // id tin nhắn cần xóa
  @IsString()
  @IsNotEmpty()
  messageId!: string
}
