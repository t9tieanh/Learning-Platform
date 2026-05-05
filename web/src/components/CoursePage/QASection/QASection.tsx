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
    <div className='py-4 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* Composer — compact single block */}
      <HighGlossBackground className='rounded-xl shadow-md shadow-blue-900/10 overflow-hidden'>
        <div className='p-4 md:p-5 space-y-3'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='flex items-start gap-3 min-w-0'>
              <div className='w-9 h-9 shrink-0 bg-white/10 rounded-lg flex items-center justify-center text-white border border-white/15'>
                <MessageCircleQuestionMark className='w-[18px] h-[18px]' strokeWidth={2} />
              </div>
              <div className='min-w-0'>
                <h2 className='text-white font-black text-[15px] tracking-tight leading-tight flex items-center gap-1.5 flex-wrap'>
                  Thảo luận bài học
                  <Sparkles className='w-3 h-3 text-amber-200/90 shrink-0' aria-hidden />
                </h2>
                <p className='text-[11px] text-blue-100/80 mt-0.5 font-medium leading-snug max-w-xl'>
                  Hỏi nhanh, chia sẻ ngắn — mọi người trong lớp đều thấy.
                </p>
              </div>
            </div>
            {!userId ? (
              <span className='text-[10px] font-bold uppercase tracking-wider text-amber-200/95 bg-white/10 px-2 py-1 rounded-md border border-white/15'>
                Cần đăng nhập
              </span>
            ) : null}
          </div>

          <div className='rounded-xl border border-white/15 bg-white/10 focus-within:border-white/25 focus-within:bg-white/[0.12] transition-colors'>
            <Textarea
              placeholder='Viết câu hỏi hoặc ý của bạn…'
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className='min-h-[72px] md:min-h-[80px] resize-none border-none focus-visible:ring-0 bg-transparent text-white/95 text-[12.5px] font-medium px-3.5 py-3 placeholder:text-white/35 leading-relaxed'
              disabled={!userId || isSubmitting}
            />
            <div className='flex justify-end px-3 pb-3'>
              <Button
                type='button'
                onClick={handleAddComment}
                disabled={!newComment.trim() || !userId || isSubmitting}
                className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-9 px-3.5 gap-1.5 text-[11px] font-bold tracking-[0.1em] shadow-sm'
              >
                {isSubmitting ? (
                  'Đang gửi…'
                ) : (
                  <>
                    <Send className='w-3 h-3' />
                    Gửi
                  </>
                )}
              </Button>
            </div>
          </div>
          {error ? <p className='text-[11px] text-red-200 font-medium'>{error}</p> : null}
        </div>
      </HighGlossBackground>

      {/* Comments List */}
      <div className='space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-none'>
        {!isLoading && comments.length === 0 && (
          <div className='flex flex-col items-center justify-center py-12 text-gray-300 space-y-2 bg-gray-50/60 rounded-xl border border-dashed border-gray-200/80'>
            <MessageSquare className='w-8 h-8 opacity-25' />
            <p className='text-[13px] font-semibold text-gray-500'>Chưa có thảo luận</p>
          </div>
        )}
        {comments.slice(0, visibleCount).map((comment: CommentUI) => (
          <div key={comment.id} className='group bg-white rounded-xl border border-gray-100 p-4 md:p-5 shadow-sm hover:shadow transition-all duration-200 space-y-4'>
            <div className='flex gap-3'>
              <div className='relative shrink-0'>
                <Avatar className='h-9 w-9 rounded-xl border border-gray-100 shadow-sm'>
                  <AvatarImage src={comment.avatar} alt={comment.author} className='object-cover' />
                  <AvatarFallback className='bg-blue-500 text-white font-bold text-[11px]'>
                    {getInitials(comment.author)}
                  </AvatarFallback>
                </Avatar>
                <div className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full' />
              </div>

              <div className='flex-1 space-y-2 min-w-0'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0'>
                    <span className='font-semibold text-gray-800 text-[13px] tracking-tight truncate'>{comment.author}</span>
                    {comment.userId === instructorId && (
                      <span className='text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold uppercase tracking-wider shrink-0'>
                        GV
                      </span>
                    )}
                    <span className='text-[10px] text-gray-400 font-bold uppercase tracking-wider shrink-0'>{comment.timestamp}</span>
                  </div>

                  {userId && userId === comment.userId && (
                    <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className='w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-all'>
                            <MoreHorizontal className='w-4 h-4' />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='rounded-xl border-gray-100 shadow-lg p-1.5 min-w-[128px]'>
                          <DropdownMenuItem
                            className='rounded-lg text-[12.5px] font-semibold text-gray-600 focus:bg-blue-50 focus:text-blue-600 gap-2 cursor-pointer'
                            onClick={() => startEdit(comment.id, false, comment.content)}
                          >
                            <Pencil className='w-3 h-3' /> Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='rounded-lg text-[12.5px] font-semibold text-red-500 focus:bg-red-50 focus:text-red-500 gap-2 cursor-pointer'
                            onClick={() => askDelete(comment.id)}
                          >
                            <Trash2 className='w-3 h-3' /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                {editingTarget && editingTarget.id === comment.id && !editingTarget.isReply ? (
                  <div className='space-y-2 bg-gray-50/80 p-3 rounded-lg border border-gray-100 mt-1'>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      disabled={isEditingSaving}
                      className='min-h-[80px] resize-none border-gray-200 rounded-lg text-[12.5px] font-medium p-3'
                    />
                    <div className='flex gap-2 justify-end'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={cancelEdit}
                        disabled={isEditingSaving}
                        className='text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg text-[11px] font-bold tracking-[0.1em] h-9'
                      >
                        Hủy
                      </Button>
                      <Button
                        size='sm'
                        onClick={saveEdit}
                        disabled={isEditingSaving || !editContent.trim()}
                        className='bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 text-[11px] font-bold tracking-[0.1em] h-9'
                      >
                        {isEditingSaving ? 'Đang lưu…' : 'Lưu'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className='text-gray-700 leading-relaxed text-[12.5px] font-medium'>{comment.content}</p>
                )}
                <div className='flex items-center gap-4 pt-0.5'>
                  <button
                    type='button'
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className='flex items-center gap-1.5 text-[11px] font-bold tracking-[0.1em] text-gray-400 hover:text-blue-600 transition-colors'
                  >
                    <MessageSquare className='w-3 h-3' />
                    Trả lời
                  </button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className='ml-9 md:ml-10 pl-4 md:pl-5 border-l border-gray-100 space-y-4'>
                {comment.replies.map((reply: ReplyUI) => (
                  <div key={reply.id} className='flex gap-3 group/reply'>
                    <Avatar className='h-8 w-8 rounded-lg border border-gray-100 shadow-sm'>
                      <AvatarImage src={reply.avatar} alt={reply.author} />
                      <AvatarFallback className='bg-gray-100 text-gray-400 text-[10px] font-bold'>
                        {getInitials(reply.author)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 space-y-1.5 min-w-0'>
                      <div className='flex items-center justify-between gap-2'>
                        <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0'>
                          <span className='font-semibold text-gray-800 text-[12.5px] tracking-tight truncate'>{reply.author}</span>
                          {reply.userId === instructorId && (
                            <span className='text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold uppercase tracking-wider shrink-0'>
                              GV
                            </span>
                          )}
                          <span className='text-[10px] text-gray-400 font-bold uppercase tracking-wider shrink-0'>{reply.timestamp}</span>
                        </div>
                        {userId && userId === reply.userId && (
                          <div className='opacity-0 group-hover/reply:opacity-100 transition-opacity'>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className='w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-all'>
                                  <MoreHorizontal className='w-3.5 h-3.5' />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end' className='rounded-xl border-gray-100 shadow-lg p-1.5 min-w-[128px]'>
                                <DropdownMenuItem
                                  className='rounded-lg text-[12.5px] font-semibold text-gray-600 focus:bg-blue-50 focus:text-blue-600 gap-2 cursor-pointer'
                                  onClick={() => startEdit(reply.id, true, reply.content, comment.id)}
                                >
                                  <Pencil className='w-3 h-3' /> Sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='rounded-lg text-[12.5px] font-semibold text-red-500 focus:bg-red-50 focus:text-red-500 gap-2 cursor-pointer'
                                  onClick={() => askDelete(reply.id, true, comment.id)}
                                >
                                  <Trash2 className='w-3 h-3' /> Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                      <p className='text-gray-600 leading-relaxed text-[12.5px] font-medium'>{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className='ml-9 md:ml-10 pl-4 md:pl-5 border-l border-blue-100/80 space-y-2 animate-in slide-in-from-top-2 duration-300'>
                <div className='border border-blue-100/80 rounded-lg overflow-hidden bg-blue-50/40'>
                  <Textarea
                    placeholder='Trả lời ngắn gọn…'
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className='min-h-[72px] resize-none border-none focus-visible:ring-0 bg-transparent text-[12.5px] font-medium p-3'
                    disabled={isSubmitting}
                  />
                </div>
                <div className='flex justify-end gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-gray-400 hover:text-gray-600 rounded-lg text-[11px] font-bold tracking-[0.1em] h-9'
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
                    className='bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 text-[11px] font-bold tracking-[0.1em] h-9'
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Load more button */}
        {visibleCount < comments.length && (
          <div className='flex justify-center py-4'>
            <Button
              variant='ghost'
              onClick={handleLoadMore}
              className='text-[11px] font-bold tracking-[0.1em] text-blue-600 hover:bg-blue-50 rounded-lg px-5 h-10 border border-blue-100/80'
            >
              Tải thêm
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
            <DialogTitle className='text-center text-[15px] font-black tracking-tight text-[#0C356A]'>Xóa bình luận?</DialogTitle>
            <DialogDescription className='text-center text-[12.5px] font-medium text-gray-500 leading-relaxed'>
              Bạn có chắc chắn muốn xóa bình luận này? <br /> Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex-col !space-x-0 gap-3 mt-6'>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className='w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl h-12 text-[11px] font-bold tracking-[0.1em] shadow-lg shadow-red-100'
            >
              {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
            <Button
              variant='ghost'
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
              className='w-full text-gray-400 hover:text-gray-600 h-10 text-[11px] font-bold tracking-[0.1em]'
            >
              Hủy bỏ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
