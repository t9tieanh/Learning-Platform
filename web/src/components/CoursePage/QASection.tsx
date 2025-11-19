import { useState } from 'react'
import { ThumbsUp, MessageSquare, Send } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Reply {
  id: string
  author: string
  content: string
  timestamp: string
  likes: number
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  likes: number
  replies: Reply[]
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'John Doe',
    content: 'This is a great discussion! Can someone explain the concept in more detail?',
    timestamp: '2 hours ago',
    likes: 12,
    replies: [
      {
        id: '1-1',
        author: 'Jane Smith',
        content: 'Sure! Let me break it down for you. The main idea is...',
        timestamp: '1 hour ago',
        likes: 5
      }
    ]
  },
  {
    id: '2',
    author: 'Mike Johnson',
    content: 'I have a question about the implementation. Has anyone tried this approach?',
    timestamp: '5 hours ago',
    likes: 8,
    replies: []
  },
  {
    id: '3',
    author: 'Emily Carter',
    content: 'This example really helped me understand the concept better. Thanks everyone!',
    timestamp: '1 day ago',
    likes: 15,
    replies: []
  },
  {
    id: '4',
    author: 'Alex Brown',
    content: 'I’m still a bit confused about the second part. Can someone clarify?',
    timestamp: '2 days ago',
    likes: 3,
    replies: []
  }
]

export const QASection = () => {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [visibleCount, setVisibleCount] = useState(2)

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      content: newComment,
      timestamp: 'Just now',
      likes: 0,
      replies: []
    }

    setComments([comment, ...comments])
    setNewComment('')
  }

  const handleAddReply = (commentId: string) => {
    if (!replyContent.trim()) return

    const reply: Reply = {
      id: `${commentId}-${Date.now()}`,
      author: 'You',
      content: replyContent,
      timestamp: 'Just now',
      likes: 0
    }

    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, replies: [...comment.replies, reply] } : comment
      )
    )

    setReplyContent('')
    setReplyingTo(null)
  }

  const handleLike = (commentId: string, replyId?: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          if (replyId) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply
              )
            }
          }
          return { ...comment, likes: comment.likes + 1 }
        }
        return comment
      })
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 2)
  }

  return (
    <div className='mx-auto p-6 space-y-6'>
      {/* New Comment Section */}
      <div className='bg-card rounded-lg border border-border p-6 space-y-4'>
        <h3 className='text-lg font-semibold text-foreground'>Bình luận</h3>
        <Textarea
          placeholder='Đặt câu hỏi hoặc chia sẻ kiến thức tại đây...'
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className='min-h-[100px] resize-none'
        />
        <div className='flex justify-end'>
          <Button onClick={handleAddComment} disabled={!newComment.trim()}>
            <Send className='w-4 h-4 mr-2' />
            Đăng
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className='space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-thumb-rounded-lg'>
        {comments.slice(0, visibleCount).map((comment) => (
          <div key={comment.id} className='bg-card rounded-lg border border-border p-6 space-y-4'>
            <div className='flex gap-4'>
              <Avatar className='h-10 w-10 flex-shrink-0'>
                <AvatarFallback className='bg-primary text-primary-foreground'>
                  {getInitials(comment.author)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 space-y-2'>
                <div className='flex items-center gap-2'>
                  <span className='font-semibold text-foreground text-sm'>{comment.author}</span>
                  <span className='text-sm text-muted-foreground'>{comment.timestamp}</span>
                </div>
                <p className='text-foreground leading-relaxed text-sm'>{comment.content}</p>
                <div className='flex items-center gap-4'>
                  <button
                    onClick={() => handleLike(comment.id)}
                    className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
                  >
                    <ThumbsUp className='w-4 h-4' />
                    <span>{comment.likes}</span>
                  </button>
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
                {comment.replies.map((reply) => (
                  <div key={reply.id} className='flex gap-4'>
                    <Avatar className='h-8 w-8 flex-shrink-0'>
                      <AvatarFallback className='bg-secondary text-secondary-foreground text-xs'>
                        {getInitials(reply.author)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-sm text-foreground'>{reply.author}</span>
                        <span className='text-xs text-muted-foreground'>{reply.timestamp}</span>
                      </div>
                      <p className='text-sm text-foreground leading-relaxed'>{reply.content}</p>
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
                  placeholder='Write your reply...'
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className='min-h-[80px] resize-none'
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
                  <Button size='sm' onClick={() => handleAddReply(comment.id)} disabled={!replyContent.trim()}>
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
    </div>
  )
}
