import { MessageSquare, Send, MoreHorizontal, Pencil, Trash2, MessageCircleQuestionMark, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useQASection, CommentUI, ReplyUI } from './helper'
import { QASectionSkeleton } from './QASectionSkeleton'

interface QASectionProps {
  lessonId: string
  instructorId: string
}

export const QASection = ({ lessonId, instructorId }: QASectionProps) => {
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

  if (isLoading) {
    return <QASectionSkeleton />
  }

  return (
    <div className='py-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* New Comment Section */}
      <HighGlossBackground className='rounded-[2.5rem] shadow-sm border border-blue-400/20 overflow-hidden'>
        <div className='p-8 space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-xl backdrop-blur-md border border-white/20 shrink-0'>
                <MessageCircleQuestionMark className='w-6 h-6' />
              </div>
              <div className='flex flex-col'>
                <h3 className='text-white font-bold text-[15px] tracking-tight leading-tight'>
                  Thảo luận bài học
                </h3>
                <p className='text-[11px] text-blue-100/60 mt-1 flex items-center gap-2 font-bold uppercase tracking-widest'>
                  <Sparkles className='w-3 h-3 text-blue-300 animate-pulse' /> Chia sẻ kiến thức của bạn
                </p>
              </div>
            </div>
            {!userId && (
              <span className='text-[9px] font-black uppercase tracking-widest text-amber-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm'>
                Yêu cầu đăng nhập
              </span>
            )}
          </div>

          <div className='relative border border-white/10 rounded-[2rem] overflow-hidden focus-within:border-blue-400/50 transition-all bg-white/5 backdrop-blur-sm'>
            <Textarea
              placeholder='Đặt câu hỏi hoặc chia sẻ cảm nghĩ của bạn tại đây...'
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className='min-h-[120px] resize-none border-none focus-visible:ring-0 bg-transparent text-white text-[13px] font-medium p-6 placeholder:text-white/30 leading-relaxed'
              disabled={!userId || isSubmitting}
            />
            <div className='absolute bottom-4 right-4 flex items-center gap-3 bg-white/5 backdrop-blur-md p-1.5 rounded-xl border border-white/10'>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || !userId || isSubmitting}
                className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 h-9 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]'
              >
                {isSubmitting ? 'Đang gửi...' : (
                  <>
                    <Send className='w-3.5 h-3.5 mr-2' />
                    Gửi thảo luận
                  </>
                )}
              </Button>
            </div>
          </div>
          {error && <p className='text-[10px] text-red-400 font-bold ml-2'>{error}</p>}
        </div>
      </HighGlossBackground>

      {/* Comments List */}
      <div className='space-y-6 max-h-[800px] overflow-y-auto pr-4 scrollbar-none'>
        {!isLoading && comments.length === 0 && (
          <div className='flex flex-col items-center justify-center py-20 text-gray-300 space-y-4 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200'>
            <MessageSquare className='w-12 h-12 opacity-20' />
            <p className='text-[12px] font-bold uppercase tracking-[0.2em]'>Chưa có thảo luận nào</p>
          </div>
        )}
        {comments.slice(0, visibleCount).map((comment: CommentUI) => (
          <div key={comment.id} className='group bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all duration-300 space-y-6'>
            <div className='flex gap-5'>
              <div className='relative shrink-0'>
                <Avatar className='h-12 w-12 rounded-2xl border-2 border-white shadow-lg'>
                  <AvatarImage src={comment.avatar} alt={comment.author} className='object-cover' />
                  <AvatarFallback className='bg-blue-500 text-white font-bold text-xs'>
                    {getInitials(comment.author)}
                  </AvatarFallback>
                </Avatar>
                <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full'></div>
              </div>

              <div className='flex-1 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <span className='font-bold text-gray-800 text-[14px] tracking-tight'>{comment.author}</span>
                    {comment.userId === instructorId && (
                      <span className='text-[9px] px-2 py-0.5 rounded-md bg-amber-500 text-white font-black uppercase tracking-widest shadow-sm'>
                        Giảng viên
                      </span>
                    )}
                    <span className='text-[10px] text-gray-400 font-bold uppercase tracking-wider'>{comment.timestamp}</span>
                  </div>

                  {userId && userId === comment.userId && (
                    <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className='w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-all'>
                            <MoreHorizontal className='w-4 h-4' />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='rounded-2xl border-gray-100 shadow-2xl p-2 min-w-[140px]'>
                          <DropdownMenuItem
                            className='rounded-xl text-[12px] font-bold text-gray-600 focus:bg-blue-50 focus:text-blue-600 gap-2 cursor-pointer'
                            onClick={() => startEdit(comment.id, false, comment.content)}
                          >
                            <Pencil className='w-3.5 h-3.5' /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='rounded-xl text-[12px] font-bold text-red-500 focus:bg-red-50 focus:text-red-500 gap-2 cursor-pointer'
                            onClick={() => askDelete(comment.id)}
                          >
                            <Trash2 className='w-3.5 h-3.5' /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                {editingTarget && editingTarget.id === comment.id && !editingTarget.isReply ? (
                  <div className='space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mt-2'>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      disabled={isEditingSaving}
                      className='min-h-[100px] resize-none border-gray-200 rounded-xl text-[13px] font-medium p-4'
                    />
                    <div className='flex gap-2 justify-end'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={cancelEdit}
                        disabled={isEditingSaving}
                        className='text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-[11px] font-bold uppercase tracking-wider'
                      >
                        Hủy
                      </Button>
                      <Button
                        size='sm'
                        onClick={saveEdit}
                        disabled={isEditingSaving || !editContent.trim()}
                        className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 text-[11px] font-bold uppercase tracking-widest'
                      >
                        {isEditingSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className='text-gray-700 leading-[1.8] text-[13.5px] font-medium'>{comment.content}</p>
                )}
                <div className='flex items-center gap-6 pt-2'>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className='flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors'
                  >
                    <MessageSquare className='w-3.5 h-3.5 mr-1' />
                    Trả lời
                  </button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className='ml-12 pl-8 border-l-2 border-gray-50 space-y-6'>
                {comment.replies.map((reply: ReplyUI) => (
                  <div key={reply.id} className='flex gap-4 group/reply'>
                    <Avatar className='h-9 w-9 rounded-xl border border-gray-100 shadow-sm'>
                      <AvatarImage src={reply.avatar} alt={reply.author} />
                      <AvatarFallback className='bg-gray-100 text-gray-400 text-[10px] font-bold'>
                        {getInitials(reply.author)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <span className='font-bold text-gray-800 text-[13px] tracking-tight'>{reply.author}</span>
                          {reply.userId === instructorId && (
                            <span className='text-[8px] px-2 py-0.5 rounded bg-amber-500 text-white font-black uppercase tracking-widest shadow-sm'>
                              Giảng viên
                            </span>
                          )}
                          <span className='text-[10px] text-gray-400 font-bold uppercase tracking-wider'>{reply.timestamp}</span>
                        </div>
                        {userId && userId === reply.userId && (
                          <div className='opacity-0 group-hover/reply:opacity-100 transition-opacity'>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className='w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-all'>
                                  <MoreHorizontal className='w-3.5 h-3.5' />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end' className='rounded-2xl border-gray-100 shadow-2xl p-2 min-w-[140px]'>
                                <DropdownMenuItem
                                  className='rounded-xl text-[12px] font-bold text-gray-600 focus:bg-blue-50 focus:text-blue-600 gap-2 cursor-pointer'
                                  onClick={() => startEdit(reply.id, true, reply.content, comment.id)}
                                >
                                  <Pencil className='w-3.5 h-3.5' /> Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='rounded-xl text-[12px] font-bold text-red-500 focus:bg-red-50 focus:text-red-500 gap-2 cursor-pointer'
                                  onClick={() => askDelete(reply.id, true, comment.id)}
                                >
                                  <Trash2 className='w-3.5 h-3.5' /> Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                      <p className='text-gray-600 leading-[1.8] text-[13px] font-medium'>{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className='ml-12 pl-8 border-l-2 border-blue-50 space-y-4 animate-in slide-in-from-top-2 duration-300'>
                <div className='relative border border-blue-100 rounded-2xl overflow-hidden bg-blue-50/30'>
                  <Textarea
                    placeholder='Viết câu trả lời...'
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className='min-h-[100px] resize-none border-none focus-visible:ring-0 bg-transparent text-[13px] font-medium p-4'
                    disabled={isSubmitting}
                  />
                </div>
                <div className='flex justify-end gap-3'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-gray-400 hover:text-gray-600 rounded-xl text-[11px] font-bold uppercase tracking-wider'
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
                    className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-blue-50'
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
          <div className='flex justify-center py-6'>
            <Button
              variant='ghost'
              onClick={handleLoadMore}
              className='text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-2xl px-8 h-12 border border-blue-100 shadow-sm transition-all hover:scale-[1.05]'
            >
              Tải thêm bình luận
            </Button>
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='rounded-[2rem] border-none shadow-2xl p-8 max-w-[400px]'>
          <DialogHeader className='space-y-4'>
            <div className='w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto'>
              <Trash2 className='w-7 h-7' />
            </div>
            <DialogTitle className='text-center text-[18px] font-bold text-gray-800'>Xóa bình luận?</DialogTitle>
            <DialogDescription className='text-center text-[13px] text-gray-500 leading-relaxed'>
              Bạn có chắc chắn muốn xóa bình luận này? <br /> Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex-col !space-x-0 gap-3 mt-6'>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className='w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl h-12 text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-red-100'
            >
              {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
            <Button
              variant='ghost'
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
              className='w-full text-gray-400 hover:text-gray-600 h-10 text-[11px] font-bold uppercase tracking-widest'
            >
              Hủy bỏ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
