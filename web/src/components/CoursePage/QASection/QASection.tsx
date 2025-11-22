import { ThumbsUp, MessageSquare, Send, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useQASection, getInitials, CommentUI, ReplyUI } from './helper'

interface QASectionProps {
  lessonId: string
}

export const QASection = ({ lessonId }: QASectionProps) => {
  const {
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
  } = useQASection(lessonId)

  return (
    <div className='mx-auto p-6 space-y-6'>
      {/* New Comment Section */}
      <div className='bg-card rounded-lg border border-border p-6 space-y-4'>
        <h3 className='text-lg font-semibold text-foreground'>Bình luận</h3>
        {!userId && <p className='text-sm text-muted-foreground'>Bạn cần đăng nhập để bình luận.</p>}
        <Textarea
          placeholder='Đặt câu hỏi hoặc chia sẻ kiến thức tại đây...'
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className='min-h-[100px] resize-none'
          disabled={!userId || isSubmitting}
        />
        <div className='flex justify-end'>
          <Button onClick={handleAddComment} disabled={!newComment.trim() || !userId || isSubmitting}>
            <Send className='w-4 h-4 mr-2' />
            Đăng
          </Button>
        </div>
        {error && <p className='text-xs text-red-500'>{error}</p>}
      </div>

      {/* Comments List */}
      <div className='space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-thumb-rounded-lg'>
        {isLoading && <p className='text-sm text-muted-foreground px-2'>Đang tải bình luận...</p>}
        {!isLoading && comments.length === 0 && (
          <p className='text-sm text-muted-foreground px-2'>Chưa có bình luận nào.</p>
        )}
        {comments.slice(0, visibleCount).map((comment: CommentUI) => (
          <div key={comment.id} className='bg-card rounded-lg border border-border p-6 space-y-4 group'>
            <div className='flex gap-4'>
              <Avatar className='h-10 w-10 flex-shrink-0'>
                <AvatarImage src={comment.avatar} alt={comment.author} />
                <AvatarFallback className='bg-primary text-primary-foreground'>
                  {getInitials(comment.author)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 space-y-2'>
                <div className='flex items-center gap-2'>
                  <span className='font-semibold text-foreground text-sm'>{comment.author}</span>
                  <span className='text-sm text-muted-foreground'>{comment.timestamp}</span>
                  {userId && userId === comment.userId && (
                    <div className='ml-auto opacity-0 group-hover:opacity-100 transition-opacity'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className='p-1 rounded text-blue-500 hover:bg-blue-500 hover:text-white transition-colors'>
                            <MoreHorizontal className='w-4 h-4' />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            className='text-blue-500 hover:bg-blue-500 focus:bg-blue-500 hover:text-white transition-colors'
                            onClick={() => startEdit(comment.id, false, comment.content)}
                          >
                            <Pencil className='w-4 h-4' /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-500 hover:bg-red-500 focus:bg-red-500 hover:text-white transition-colors'
                            onClick={() => askDelete(comment.id)}
                          >
                            <Trash2 className='w-4 h-4' /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                {editingTarget && editingTarget.id === comment.id && !editingTarget.isReply ? (
                  <div className='space-y-2'>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      disabled={isEditingSaving}
                      className='min-h-[80px] resize-none'
                    />
                    <div className='flex gap-2 justify-end'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={cancelEdit}
                        disabled={isEditingSaving}
                        className='border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                      >
                        Hủy
                      </Button>
                      {(() => {
                        const originalContent =
                          comments.find((c: CommentUI) => c.id === editingTarget.id)?.content || ''
                        const unchanged = originalContent.trim() === editContent.trim()
                        return (
                          <Button
                            size='sm'
                            onClick={saveEdit}
                            disabled={isEditingSaving || !editContent.trim() || unchanged}
                            className='bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'
                          >
                            {isEditingSaving ? 'Đang lưu...' : 'Lưu'}
                          </Button>
                        )
                      })()}
                    </div>
                  </div>
                ) : (
                  <p className='text-foreground leading-relaxed text-sm'>{comment.content}</p>
                )}
                <div className='flex items-center gap-4'>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
                  >
                    <MessageSquare className='w-4 h-4' />
                    <span>Trả lời</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className='ml-14 space-y-4 pt-4 border-t border-border'>
                {comment.replies.map((reply: ReplyUI) => (
                  <div key={reply.id} className='flex gap-4 group'>
                    <Avatar className='h-8 w-8 flex-shrink-0'>
                      <AvatarImage src={reply.avatar} alt={reply.author} />
                      <AvatarFallback className='bg-secondary text-secondary-foreground text-xs'>
                        {getInitials(reply.author)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-sm text-foreground'>{reply.author}</span>
                        <span className='text-xs text-muted-foreground'>{reply.timestamp}</span>
                        {userId && userId === reply.userId && (
                          <div className='ml-auto opacity-0 group-hover:opacity-100 transition-opacity'>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className='p-1 rounded text-blue-500 hover:bg-blue-500 hover:text-white transition-colors'>
                                  <MoreHorizontal className='w-4 h-4' />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  className='text-blue-500 hover:bg-blue-500 focus:bg-blue-500'
                                  onClick={() => startEdit(reply.id, true, reply.content, comment.id)}
                                >
                                  <Pencil className='w-4 h-4' /> Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='text-red-500 hover:bg-red-500 focus:bg-red-500'
                                  onClick={() => askDelete(reply.id, true, comment.id)}
                                >
                                  <Trash2 className='w-4 h-4' /> Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                      {editingTarget && editingTarget.id === reply.id && editingTarget.isReply ? (
                        <div className='space-y-2'>
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            disabled={isEditingSaving}
                            className='min-h-[60px] resize-none'
                          />
                          <div className='flex gap-2 justify-end'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={cancelEdit}
                              disabled={isEditingSaving}
                              className='border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                            >
                              Hủy
                            </Button>
                            {(() => {
                              const parent = comments.find((c: CommentUI) => c.id === editingTarget.parentId)
                              const originalContent =
                                parent?.replies.find((r: ReplyUI) => r.id === editingTarget.id)?.content || ''
                              const unchanged = originalContent.trim() === editContent.trim()
                              return (
                                <Button
                                  size='sm'
                                  onClick={saveEdit}
                                  disabled={isEditingSaving || !editContent.trim() || unchanged}
                                  className='bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'
                                >
                                  {isEditingSaving ? 'Đang lưu...' : 'Lưu'}
                                </Button>
                              )
                            })()}
                          </div>
                        </div>
                      ) : (
                        <p className='text-sm text-foreground leading-relaxed'>{reply.content}</p>
                      )}
                      <button
                        onClick={() => handleLike(comment.id, reply.id)}
                        className='flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors'
                      >
                        <ThumbsUp className='w-3 h-3' />
                        <span>{reply.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className='ml-14 space-y-3 pt-4 border-t border-border'>
                <Textarea
                  placeholder='Viết trả lời của bạn...'
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className='min-h-[80px] resize-none'
                  disabled={isSubmitting}
                />
                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyContent('')
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    size='sm'
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyContent.trim() || isSubmitting}
                  >
                    Trả lời
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Load more button */}
        {visibleCount < comments.length && (
          <div className='flex justify-center !hover:bg-transparent'>
            <Button
              variant='ghost'
              onClick={handleLoadMore}
              style={{ backgroundColor: 'transparent' }}
              className='text-muted-foreground hover:text-blue-500 hover:underline'
            >
              Xem thêm
            </Button>
          </div>
        )}
      </div>
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa bình luận</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
