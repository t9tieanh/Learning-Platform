import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
    Send,
    Bot,
    User,
    Play,
    Loader2,
    Sparkles,
    MessageSquarePlus,
    Pencil,
    Check,
    X,
    StickyNote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import learnovaLogo from '@/assets/images/logo1.png'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import assistantAnalysisService, {
    type LessonChatSessionListItemDto,
} from '@/services/assistant/analysis.service'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useAuthStore } from '@/stores/useAuth.stores'
import type { AIChatSectionProps, LessonAiChatMessage } from '@/types/lesson-ai-chat.type'
import { formatSessionPickLabel, mapLessonChatHistoryToUi } from '@/utils/lessonAiChat.utils'
import { PremiumLockedState } from './PremiumLockedState'

export const AIChatSection: React.FC<AIChatSectionProps> = ({
    lessonId,
    onSeek,
    isTabVisible = true,
}) => {
    const { data: user } = useAuthStore()
    const [messages, setMessages] = useState<LessonAiChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessions, setSessions] = useState<LessonChatSessionListItemDto[]>([])
    const [sessionsLoading, setSessionsLoading] = useState(false)
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [creatingSession, setCreatingSession] = useState(false)

    /** Server chat session — required for transcript + semantic recall on the assistant */
    const [chatSessionId, setChatSessionId] = useState<string | null>(null)
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [updatingTitle, setUpdatingTitle] = useState(false)

    const [isEditingNote, setIsEditingNote] = useState(false)
    const [editNote, setEditNote] = useState('')
    const [updatingNote, setUpdatingNote] = useState(false)

    const scrollRef = useRef<HTMLDivElement>(null)

    const handleUpdateTitle = async () => {
        if (!chatSessionId || !editTitle.trim() || updatingTitle) return
        setUpdatingTitle(true)
        try {
            const res = await assistantAnalysisService.updateLessonChatSessionTitle(
                lessonId,
                chatSessionId,
                editTitle
            )
            if (res.code === 200) {
                setSessions((prev) =>
                    prev.map((s) => (s.id === chatSessionId ? { ...s, title: editTitle } : s))
                )
                setIsEditingTitle(false)
            }
        } catch (e) {
            console.error('updateLessonChatSessionTitle', e)
        } finally {
            setUpdatingTitle(false)
        }
    }

    const handleUpdateNote = async () => {
        if (!chatSessionId || updatingNote) return
        setUpdatingNote(true)
        try {
            const res = await assistantAnalysisService.updateLessonChatSessionNotes(
                lessonId,
                chatSessionId,
                editNote
            )
            if (res.code === 200) {
                setSessions((prev) =>
                    prev.map((s) => (s.id === chatSessionId ? { ...s, notes: editNote } : s))
                )
                setIsEditingNote(false)
            }
        } catch (e) {
            console.error('updateLessonChatSessionNotes', e)
        } finally {
            setUpdatingNote(false)
        }
    }

    useEffect(() => {
        setChatSessionId(null)
        setMessages([])
        setIsEditingTitle(false)
        setIsEditingNote(false)
        const fetchSessions = async () => {
            if (!lessonId || lessonId === 'undefined') return
            setSessionsLoading(true)
            try {
                const res = await assistantAnalysisService.listLessonChatSessions(lessonId)
                if (res.code === 200 && res.result) {
                    setSessions(res.result)
                    if (res.result.length > 0) {
                        setChatSessionId(res.result[0].id)
                    }
                }
            } catch (e) {
                console.error('listLessonChatSessions', e)
            } finally {
                setSessionsLoading(false)
            }
        }
        fetchSessions()
    }, [lessonId])

    useEffect(() => {
        if (!isTabVisible || !lessonId || lessonId === 'undefined') {
            return
        }
        if (!chatSessionId) {
            setMessages([])
            setMessagesLoading(false)
            return
        }
        if (!user?.isVip) return

        let cancelled = false
            ; (async () => {
                setMessagesLoading(true)
                try {
                    const res = await assistantAnalysisService.getLessonChatMessages(lessonId, chatSessionId)
                    if (cancelled) return
                    if (res.code === 200 && Array.isArray(res.result)) {
                        setMessages(mapLessonChatHistoryToUi(res.result))
                    } else {
                        setMessages([])
                    }
                } catch (e) {
                    console.error('getLessonChatMessages', e)
                    if (!cancelled) setMessages([])
                } finally {
                    if (!cancelled) setMessagesLoading(false)
                }
            })()
        return () => {
            cancelled = true
            setMessagesLoading(false)
        }
    }, [isTabVisible, lessonId, chatSessionId, user?.isVip])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const reloadSessionsPreserveSelection = useCallback(async (): Promise<
        LessonChatSessionListItemDto[]
    > => {
        const res = await assistantAnalysisService.listLessonChatSessions(lessonId)
        const list =
            res.code === 200 && Array.isArray(res.result) ? res.result : []
        setSessions(list)
        return list
    }, [lessonId])

    const handleNewChat = async () => {
        if (!lessonId || lessonId === 'undefined' || creatingSession) return
        setCreatingSession(true)
        try {
            const res = await assistantAnalysisService.createLessonChatSession(lessonId)
            if (res.code === 201 && res.result) {
                const newId = res.result.sessionId
                setSessions((prev) => [
                    {
                        id: newId,
                        lessonId,
                        title: null,
                        summaryLast: null,
                        notes: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        messageCount: 0,
                    },
                    ...prev,
                ])
                setChatSessionId(newId)
                await reloadSessionsPreserveSelection()
            }
        } catch (e) {
            console.error('createLessonChatSession', e)
        } finally {
            setCreatingSession(false)
        }
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading) return
        if (!lessonId || lessonId === 'undefined') {
            const warning: LessonAiChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Vui lòng chọn một bài học cụ thể để tôi có thể hỗ trợ bạn tốt nhất!',
            }
            setMessages((prev) => [...prev, warning])
            return
        }

        const userMessage: LessonAiChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await assistantAnalysisService.askAI(lessonId, input, chatSessionId)
            if (response.code === 200 && response.result) {
                if (response.result.sessionId) {
                    setChatSessionId(response.result.sessionId)
                }
                const aiMessage: LessonAiChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.result.answer,
                    sources: response.result.sources,
                }
                setMessages((prev) => [...prev, aiMessage])
                void reloadSessionsPreserveSelection()
            } else {
                const errorMessage: LessonAiChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `[Lỗi ${response.code}]: ${response.message || 'Hệ thống đang gặp sự cố, vui lòng thử lại sau.'}`,
                }
                setMessages((prev) => [...prev, errorMessage])
            }
        } catch (error) {
            console.error('Failed to get AI answer', error)
            const errorMessage: LessonAiChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content:
                    'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    if (!user?.isVip) {
        return <PremiumLockedState />
    }

    return (
        <div className='flex flex-col h-full bg-white relative overflow-hidden'>
            {/* Chỉ chọn phiên khi đã có lịch sử; không đặt nút tạo phiên ở đây */}
            <div className='relative z-20 shrink-0 border-b border-white/10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950 p-3 shadow-lg'>
                <div className='absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#ffffff,transparent)] pointer-events-none' />
                <div className='absolute inset-0 opacity-5 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] pointer-events-none' />

                {sessionsLoading ? (
                    <div className='flex items-center justify-center gap-2 py-3 text-[11px] text-blue-100/60 font-medium'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        <span>Đang tải các phiên chat...</span>
                    </div>
                ) : (
                    <div className='relative z-10 space-y-3'>
                        <div className='flex items-center gap-2'>
                            <div className='flex-1 min-w-0'>
                                {isEditingTitle ? (
                                    <div className='flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300'>
                                        <input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateTitle()
                                                if (e.key === 'Escape') setIsEditingTitle(false)
                                            }}
                                            autoFocus
                                            className='h-8 w-full rounded-lg border border-white/20 bg-white/10 px-3 text-[12px] font-semibold text-white placeholder:text-white/40 shadow-inner focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all'
                                            placeholder='Tên phiên mới...'
                                        />
                                        <div className='flex items-center gap-1'>
                                            <Button
                                                onClick={handleUpdateTitle}
                                                disabled={updatingTitle || !editTitle.trim()}
                                                size='icon'
                                                className='h-7.5 w-7.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white shadow-lg transition-all active:scale-95'
                                            >
                                                {updatingTitle ? (
                                                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                                ) : (
                                                    <Check className='h-3.5 w-3.5' />
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => setIsEditingTitle(false)}
                                                variant='ghost'
                                                size='icon'
                                                className='h-7.5 w-7.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95'
                                            >
                                                <X className='h-3.5 w-3.5' />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex items-center gap-2'>
                                        <Select
                                            value={chatSessionId || ''}
                                            disabled={sessions.length === 0}
                                            onValueChange={(id) => {
                                                setChatSessionId(id)
                                                setIsEditingTitle(false)
                                                setIsEditingNote(false)
                                            }}
                                        >
                                            <SelectTrigger
                                                size='sm'
                                                className='w-full h-8.5 rounded-lg border-white/10 bg-white/5 text-[12px] font-bold !text-white shadow-lg backdrop-blur-sm hover:border-white/20 hover:bg-white/10 transition-all px-3 disabled:opacity-70'
                                            >
                                                <div className='flex items-center gap-2 !text-white'>
                                                    <MessageSquarePlus className='w-3.5 h-3.5 !text-white' />
                                                    <SelectValue placeholder='Chọn phiên' className='!text-white' />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className='rounded-xl shadow-2xl border-white/10 bg-white'>
                                                {sessions.map((s) => (
                                                    <SelectItem
                                                        key={s.id}
                                                        value={s.id}
                                                        className='text-[12px] py-2 px-3 focus:bg-blue-50 focus:text-blue-700 cursor-pointer rounded-lg mx-1.5 my-0.5 transition-colors'
                                                    >
                                                        <div className='flex flex-col gap-0.5'>
                                                            <div className='font-bold truncate max-w-[200px]'>
                                                                {s.title || (s.summaryLast ? s.summaryLast.substring(0, 30) + '...' : `Phiên ${new Date(s.createdAt).toLocaleDateString('vi-VN')}`)}
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className='flex items-center gap-1 shrink-0'>
                                            {chatSessionId && (
                                                <>
                                                    <Button
                                                        onClick={() => {
                                                            const current = sessions.find((s) => s.id === chatSessionId)
                                                            setEditTitle(current?.title || '')
                                                            setIsEditingTitle(true)
                                                        }}
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-8.5 w-8.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10'
                                                        title='Đổi tên phiên'
                                                    >
                                                        <Pencil className='h-3.5 w-3.5' />
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            const current = sessions.find((s) => s.id === chatSessionId)
                                                            setEditNote(current?.notes || '')
                                                            setIsEditingNote(!isEditingNote)
                                                        }}
                                                        variant='ghost'
                                                        size='icon'
                                                        className={cn(
                                                            'h-8.5 w-8.5 rounded-lg transition-all border border-transparent',
                                                            isEditingNote
                                                                ? 'bg-white/20 text-white border-white/20'
                                                                : 'text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10'
                                                        )}
                                                        title='Ghi chú hướng dẫn AI'
                                                    >
                                                        <StickyNote className='h-3.5 w-3.5' />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Note area expansion */}
                        {isEditingNote && (
                            <div className='animate-in fade-in slide-in-from-top-1 duration-300 space-y-2 p-2.5 rounded-xl bg-white/5 border border-white/10'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-1.5 text-[10px] font-bold text-blue-200 uppercase tracking-wider'>
                                        <StickyNote className='w-3 h-3' />
                                        <span>Ghi chú cho AI</span>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Button
                                            onClick={handleUpdateNote}
                                            disabled={updatingNote}
                                            variant='ghost'
                                            size='sm'
                                            className='h-6 px-2.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[9px] font-bold gap-1 transition-all'
                                        >
                                            {updatingNote ? (
                                                <Loader2 className='w-2.5 h-2.5 animate-spin' />
                                            ) : (
                                                <Check className='w-2.5 h-2.5' />
                                            )}
                                            Lưu
                                        </Button>
                                        <Button
                                            onClick={() => setIsEditingNote(false)}
                                            variant='ghost'
                                            size='icon'
                                            className='h-6 w-6 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10'
                                        >
                                            <X className='w-2.5 h-2.5' />
                                        </Button>
                                    </div>
                                </div>
                                <Textarea
                                    value={editNote}
                                    onChange={(e) => setEditNote(e.target.value)}
                                    placeholder='VD: Hãy giải thích ngắn gọn, tập trung vào code...'
                                    className='min-h-[60px] bg-white/10 border-white/10 text-white text-[12px] placeholder:text-white/20 rounded-lg focus-visible:ring-blue-400/30 resize-none py-1.5 px-2.5'
                                />
                            </div>
                        )}

                        <div className='flex gap-2 pt-1'>
                            <Button
                                type='button'
                                onClick={handleNewChat}
                                disabled={!lessonId || lessonId === 'undefined' || creatingSession || isLoading}
                                className='h-8.5 flex-1 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/20 text-[11px] font-bold gap-2 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 group'
                            >
                                {creatingSession ? (
                                    <Loader2 className='w-3.5 h-3.5 animate-spin' />
                                ) : (
                                    <MessageSquarePlus className='w-3.5 h-3.5 group-hover:rotate-6 transition-transform' />
                                )}
                                Tạo cuộc trò chuyện mới
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className='flex-1 min-h-0 overflow-y-auto p-4 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-gray-100 relative'
            >
                {messagesLoading && (
                    <div className='absolute inset-0 bg-white/60 z-10 flex items-center justify-center'>
                        <div className='flex items-center gap-2 text-[13px] text-gray-600 font-medium'>
                            <Loader2 className='w-5 h-5 animate-spin text-blue-600' /> Đang tải
                            lịch sử…
                        </div>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className='h-full flex flex-col items-center justify-center text-center px-8 space-y-4'>
                        <div className='w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center p-3 shadow-inner'>
                            <img
                                src={learnovaLogo}
                                alt='Learnova'
                                className='w-full h-full object-contain filter drop-shadow-sm'
                            />
                        </div>
                        <div className='space-y-2'>
                            <h3 className='text-[15px] font-bold text-gray-800'>
                                Hỏi đáp cùng trợ lý AI
                            </h3>
                            <p className='text-[13px] text-gray-500 max-w-[280px] mx-auto leading-relaxed'>
                                {chatSessionId ? (
                                    <>
                                        Đặt câu hỏi về nội dung bài giảng này. Tôi sẽ giúp bạn tìm câu
                                        trả lời từ video!
                                    </>
                                ) : sessionsLoading ? (
                                    <>Đang tải các phiên chat của bạn…</>
                                ) : (
                                    <>
                                        Nhấn nút &quot;Tạo cuộc trò chuyện mới&quot; ở trên để mở
                                        phiên hỏi đáp với AI trong bối cảnh bài học này.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((m) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={m.id}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {m.role === 'user' ? (
                                        <User className='w-4 h-4' />
                                    ) : (
                                        <Bot className='w-4 h-4' />
                                    )}
                                </div>
                                <div className='space-y-3'>
                                    <div
                                        className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed font-medium shadow-sm ${m.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
                                            }`}
                                    >
                                        {m.role === 'assistant' ? (
                                            <div className='react-markdown-container'>
                                                <ReactMarkdown>{m.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            m.content
                                        )}
                                    </div>

                                    {/* Sources / References */}
                                    {m.sources && m.sources.length > 0 && (
                                        <div className='space-y-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-500'>
                                            <p className='text-[11px] font-bold text-gray-400 tracking-widest flex items-center gap-2'>
                                                <Sparkles className='w-3 h-3 text-blue-400' />{' '}
                                                Nguồn tham chiếu từ video
                                            </p>
                                            <div className='grid gap-2'>
                                                {m.sources.map((source, idx) => (
                                                    <div
                                                        key={idx}
                                                        className='bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:border-blue-200 transition-all group'
                                                    >
                                                        <div className='flex items-start justify-between gap-3'>
                                                            <div className='flex-1 space-y-1.5'>
                                                                <div className='flex items-center gap-2'>
                                                                    <span className='text-[12px] font-bold text-gray-800 line-clamp-1'>
                                                                        {source.title ||
                                                                            `Đoạn ${idx + 1}`}
                                                                    </span>
                                                                    <span className='text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold whitespace-nowrap'>
                                                                        {source.startTime}
                                                                    </span>
                                                                </div>
                                                                {source.summary && (
                                                                    <p className='text-[11px] text-gray-500 leading-relaxed line-clamp-2 italic italic-muted'>
                                                                        {source.summary}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    onSeek?.(source.startTime || '0')
                                                                }
                                                                className='w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shrink-0'
                                                                title='Tua ngay'
                                                                type='button'
                                                            >
                                                                <Play className='w-3.5 h-3.5 fill-current ml-0.5' />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}

                {isLoading && (
                    <div className='flex justify-start animate-in fade-in duration-300'>
                        <div className='flex gap-3 max-w-[85%]'>
                            <div className='w-8 h-8 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center animate-pulse'>
                                <Bot className='w-4 h-4' />
                            </div>
                            <div className='bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2'>
                                <Loader2 className='w-4 h-4 animate-spin text-blue-500' />
                                <span className='text-[13px] text-gray-500 font-medium italic'>
                                    Đang phân tích bài giảng...
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input — chỉ hiện khi đã có session */}
            {chatSessionId ? (
                <div className='shrink-0 p-4 border-t border-gray-100 bg-gray-50/50'>
                    <div className='relative flex items-end gap-2'>
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            placeholder='Hỏi AI bất cứ điều gì về bài giảng này...'
                            className='min-h-[48px] max-h-32 py-3 px-4 rounded-2xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 text-[14px] bg-white resize-none pr-12 transition-all shadow-sm'
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            size='icon'
                            type='button'
                            className='absolute right-2 bottom-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all h-9 w-9'
                        >
                            {isLoading ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                                <Send className='h-4 w-4' />
                            )}
                        </Button>
                    </div>
                    <p className='text-[10px] text-gray-400 mt-2 text-center font-medium'>
                        AI có thể nhầm lẫn. Vui lòng kiểm tra lại các nguồn tham chiếu được cung cấp.
                    </p>
                </div>
            ) : null}
        </div>
    )
}
