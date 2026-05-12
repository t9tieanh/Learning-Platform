import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
    Send,
    Bot,
    User,
    Play,
    Loader2,
    Sparkles,
    MessageSquarePlus,
    MessageSquare,
    Pencil,
    Check,
    X,
    StickyNote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import learnovaLogo from '@/assets/images/LEARNOVA_sm.png'
import aiAssistantEmpty from '@/assets/images/ai-assistant-empty.png'
import { Button } from '@/components/ui/button'
import CustomButton from '@/components/common/Button'
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
    type RAGSource,
} from '@/services/assistant/analysis.service'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useAuthStore } from '@/stores/useAuth.stores'
import type { AIChatSectionProps, LessonAiChatMessage } from '@/types/lesson-ai-chat.type'
import { formatSessionPickLabel, mapLessonChatHistoryToUi } from '@/utils/lessonAiChat.utils'
import { PremiumLockedState } from './PremiumLockedState'
import RemediationVideoPlayer from './LessonTestStudentSection/RemediationVideoPlayer'
import { LessonChunk } from '@/types/ai'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'

export const AIChatSection: React.FC<AIChatSectionProps> = ({
    lessonId,
    onSeek,
    isTabVisible = true,
    subtitlesRaw
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
    const [activePlayerKey, setActivePlayerKey] = useState<string | null>(null);

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
        <div className='flex flex-col h-full bg-[#fcfdfe] relative overflow-hidden w-full p-0 m-0'>
            {/* Chỉ chọn phiên khi đã có lịch sử; không đặt nút tạo phiên ở đây */}
            <div 
                className='relative z-20 shrink-0 border-b border-white/10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950 shadow-lg transition-all duration-300 group w-full p-3 flex flex-col items-stretch'
            >
                <div className='absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#ffffff,transparent)] pointer-events-none' />
                <div className='absolute inset-0 opacity-5 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] pointer-events-none' />

                {sessionsLoading ? (
                    <div className='flex items-center justify-center gap-2 py-3 text-[11px] text-blue-100/60 font-medium'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        <span>Đang tải các phiên chat...</span>
                    </div>
                ) : (
                    <div className='relative z-10 w-full flex flex-col space-y-3 items-stretch self-stretch'>
                        {isEditingTitle ? (
                            <div className='flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300 w-full'>
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
                                <div className='flex items-center gap-1 shrink-0'>
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
                            <div className='relative flex items-stretch w-full self-stretch'>
                                <div className='flex-1 min-w-0 w-full transition-all duration-300 flex items-center self-stretch' style={{ width: '100%' }}>
                                    {sessions.length > 0 && (
                                        <div className="w-full flex">
                                            <Select
                                                value={chatSessionId || ''}
                                                onValueChange={(id) => {
                                                    setChatSessionId(id)
                                                    setIsEditingTitle(false)
                                                    setIsEditingNote(false)
                                                }}
                                            >
                                                <SelectTrigger 
                                                    className='h-8.5 w-full min-w-full bg-white/10 border-white/10 text-white hover:bg-white/20 text-[11px] font-bold gap-2 transition-all shadow-lg active:scale-[0.98]'
                                                    style={{ width: '100% !important' }}
                                                >
                                                    <MessageSquare className='h-3.5 w-3.5 shrink-0 opacity-80' />
                                                    <div className='flex-1 truncate text-left'>
                                                        {sessions.find((s) => s.id === chatSessionId)?.title ||
                                                            'Chọn phiên chat'}
                                                    </div>
                                                </SelectTrigger>
                                            <SelectContent className='bg-white/95 backdrop-blur-xl border-blue-100 shadow-2xl rounded-xl overflow-hidden'>
                                                {sessions.map((session) => (
                                                    <SelectItem
                                                        key={session.id}
                                                        value={session.id}
                                                        className='text-[11px] font-medium py-2.5 focus:bg-blue-50 focus:text-blue-700 transition-colors'
                                                    >
                                                        {session.title || `Phiên ${new Date(session.createdAt).toLocaleDateString('vi-VN')}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    )}
                                </div>

                                <div className='hidden group-hover:flex items-center shrink-0 opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-300 ml-0 group-hover:ml-3 pr-0 group-hover:pr-1'>
                                    <div className='flex items-center gap-2'>
                                        {chatSessionId && (
                                            <>
                                                <Button
                                                    onClick={() => {
                                                        const current = sessions.find((s) => s.id === chatSessionId)
                                                        setEditTitle(current?.title || '')
                                                        setIsEditingTitle(!isEditingTitle)
                                                    }}
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8.5 w-8.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 bg-white/5 scale-90 group-hover:scale-100 transition-all duration-200'
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
                                                            : 'text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 bg-white/5 scale-90 group-hover:scale-100 transition-all duration-200'
                                                    )}
                                                    title='Ghi chú hướng dẫn AI'
                                                >
                                                    <StickyNote className='h-3.5 w-3.5' />
                                                </Button>

                                                <Button
                                                    onClick={handleNewChat}
                                                    disabled={creatingSession || isLoading}
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-8.5 w-8.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 bg-white/5 scale-90 group-hover:scale-100 transition-all duration-200'
                                                    title='Tạo cuộc trò chuyện mới'
                                                >
                                                    {creatingSession ? (
                                                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                                    ) : (
                                                        <MessageSquarePlus className='h-3.5 w-3.5' />
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isEditingNote && (
                            <div className='animate-in fade-in slide-in-from-top-1 duration-300 space-y-2 p-2.5 rounded-xl bg-white/5 border border-white/10'>
                                <div className='flex items-center justify-between gap-6'>
                                    <div className='flex items-center gap-2 flex-1 min-w-0 max-w-[calc(100%-120px)] text-[10px] font-bold text-blue-200 uppercase tracking-wider'>
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

                    </div>
                )}
            </div>

            <div
                ref={scrollRef}
                className='flex-1 min-h-0 overflow-y-auto p-4 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-gray-100 relative'
            >
                {messagesLoading && (
                    <div className='absolute inset-0 bg-white/60 z-10 flex items-center justify-center'>
                        <div className='flex items-center gap-2 text-[12px] text-gray-600 font-medium'>
                            <Loader2 className='w-5 h-5 animate-spin text-blue-600' /> Đang tải
                            lịch sử…
                        </div>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className='h-full flex flex-col items-center justify-center text-center px-8 relative overflow-hidden'>
                        {/* Decorative background elements */}
                        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-400/5 blur-[80px] rounded-full pointer-events-none' />
                        <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/80 to-transparent pointer-events-none' />

                        <div className='relative z-10 w-full max-w-[280px] animate-in fade-in zoom-in duration-700'>
                            <div className='mb-8 transform transition-transform hover:scale-105 duration-700 ease-out'>
                                <img
                                    src={aiAssistantEmpty}
                                    alt='AI Assistant'
                                    className='w-full h-auto mix-blend-multiply opacity-90'
                                />
                            </div>
                            
                            <div className='space-y-3'>
                                <h3 className='text-[16px] font-black tracking-tight text-slate-800 chatbot-heading'>
                                    Sẵn sàng hỗ trợ bạn
                                </h3>
                                <p className='text-[12px] text-slate-500 leading-relaxed font-medium chatbot-body'>
                                    {chatSessionId ? (
                                        <span className='opacity-80'>
                                            Đặt câu hỏi về bài giảng này, tôi sẽ giúp bạn tóm tắt và tìm kiến thức từ video ngay lập tức!
                                        </span>
                                    ) : sessionsLoading ? (
                                        <span className='flex items-center justify-center gap-2'>
                                            <Loader2 className='w-3 h-3 animate-spin text-blue-500' />
                                            Đang chuẩn bị dữ liệu học tập...
                                        </span>
                                    ) : (
                                        <span className='opacity-80'>
                                            Hãy bắt đầu một hành trình học tập mới bằng cách tạo cuộc trò chuyện ở phía trên.
                                        </span>
                                    )}
                                </p>
                            </div>
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
                                        className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm ${m.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
                                            }`}
                                    >
                                        {m.role === 'assistant' ? (
                                            <div className='react-markdown-container'>
                                                {(() => {
                                                    const text = m.content;
                                                    const parts = text.split(/(@{{.*?}}@)/g);
                                                    const hasMarkers = parts.some(p => p.match(/@{{(.*?)}}@/));
                                                    
                                                    return parts.map((part, index) => {
                                                        const match = part.match(/@{{(.*?)}}@/);
                                                        if (match) {
                                                            const chunkId = match[1];
                                                            const source = m.sources?.find(s => s.chunkId === chunkId);
                                                            if (!source) return <span key={index} className="text-red-400 opacity-50 text-[10px]">[Nguồn lỗi]</span>;

                                                            const playerKey = `${m.id}:${chunkId}`;
                                                            const isPlayerOpen = activePlayerKey === playerKey;

                                                            return (
                                                                <button
                                                                    key={index}
                                                                    onClick={() => {
                                                                        // If player for this specific message+source is already open, close it. 
                                                                        // Otherwise, open it and seek.
                                                                        if (isPlayerOpen) {
                                                                            setActivePlayerKey(null);
                                                                        } else {
                                                                            setActivePlayerKey(playerKey);
                                                                            onSeek?.(source.startTime || '0');
                                                                        }
                                                                    }}
                                                                    className={cn(
                                                                        "inline-flex items-center gap-1.5 px-3 py-1 mx-1 rounded-full text-[10px] font-bold transition-all border shadow-sm align-middle mb-1 group/badge",
                                                                        isPlayerOpen 
                                                                            ? "bg-blue-600 text-white border-blue-600 shadow-blue-200" 
                                                                            : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                                                                    )}
                                                                    title={`Xem đoạn video: ${source.title || 'Nội dung bài học'} (${source.startTime})`}
                                                                >
                                                                    <Play className={cn("w-2.5 h-2.5 fill-current shrink-0", isPlayerOpen && "animate-pulse")} />
                                                                    <span className="max-w-[150px] truncate">
                                                                        {source.title || 'Nội dung bài học'}
                                                                    </span>
                                                                </button>
                                                            );
                                                        }
                                                        return (
                                                            <span key={index} className="inline">
                                                                <ReactMarkdown components={{ p: 'span' }}>
                                                                    {part}
                                                                </ReactMarkdown>
                                                            </span>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        ) : (
                                            m.content
                                        )}
                                    </div>

                                    {/* Inline Player for sources cited in the text */}
                                    {activePlayerKey && m.sources?.some(s => activePlayerKey === `${m.id}:${s.chunkId}`) && (
                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {(() => {
                                                const chunkId = activePlayerKey.split(':')[1];
                                                const source = m.sources.find(s => s.chunkId === chunkId);
                                                if (!source) return null;
                                                const chunk: LessonChunk = {
                                                    id: source.chunkId,
                                                    title: source.title || 'Đoạn trích',
                                                    summary: source.summary,
                                                    startTime: source.startTime || '00:00',
                                                    endTime: source.endTime || '00:00',
                                                    chunkIndex: source.chunkIndex,
                                                    timestamp: source.startTime,
                                                    sentenceCount: 0
                                                };
                                                return (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between px-2">
                                                            <CustomButton 
                                                                onClick={() => onSeek?.(source.startTime || '0')}
                                                                label="Xem ở màn hình lớn"
                                                                icon={<Sparkles className="w-3 h-3" />}
                                                                className="h-7 text-[10px] font-bold px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-none shadow-none"
                                                                title="Chuyển sang trình phát chính"
                                                            />
                                                        </div>
                                                        <RemediationVideoPlayer
                                                            lessonId={lessonId}
                                                            chunk={chunk}
                                                            subtitlesRaw={subtitlesRaw}
                                                        />
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* Legacy Sources / References - Only show if NO markers are detected in the content */}
                                    {m.sources && m.sources.length > 0 && !m.content.includes('@{{') && (
                                        <div className='space-y-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-500'>
                                            <p className='text-[11px] font-bold text-gray-400 tracking-widest flex items-center gap-2'>
                                                <Sparkles className='w-3 h-3 text-blue-400' />{' '}
                                                Nguồn tham chiếu từ video
                                            </p>
                                            <div className='grid gap-2'>
                                                {m.sources.map((source: RAGSource, idx: number) => {
                                                    const playerKey = `${m.id}:${source.chunkId}`;
                                                    const isPlayerOpen = activePlayerKey === playerKey;
                                                    const chunk: LessonChunk = {
                                                        id: source.chunkId,
                                                        title: source.title || `Đoạn ${idx + 1}`,
                                                        summary: source.summary,
                                                        startTime: source.startTime || '00:00',
                                                        endTime: source.endTime || '00:00',
                                                        chunkIndex: source.chunkIndex,
                                                        timestamp: source.startTime,
                                                        sentenceCount: 0
                                                    }

                                                    return (
                                                        <div key={idx} className='space-y-2'>
                                                            <div
                                                                className={cn(
                                                                    'bg-white border rounded-xl p-3 shadow-sm transition-all group',
                                                                    isPlayerOpen ? 'border-blue-400 ring-1 ring-blue-400/20' : 'border-gray-100 hover:border-blue-200'
                                                                )}
                                                            >
                                                                <div className='flex flex-col gap-1.5'>
                                                                    <div className='flex items-center justify-between'>
                                                                        <span className='text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow-sm border border-blue-100/50'>
                                                                            {source.startTime}
                                                                        </span>
                                                                        <div className='flex items-center gap-1.5'>
                                                                            <button
                                                                                onClick={() => onSeek?.(source.startTime || '0')}
                                                                                className='w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shrink-0 border border-gray-100 hover:border-blue-600 shadow-sm'
                                                                                title='Xem trên video chính'
                                                                                type='button'
                                                                            >
                                                                                <Sparkles className='w-3.5 h-3.5' />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setActivePlayerKey(isPlayerOpen ? null : playerKey)}
                                                                                className={cn(
                                                                                    'w-8 h-8 rounded-lg transition-all flex items-center justify-center shrink-0 border shadow-sm',
                                                                                    isPlayerOpen
                                                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200'
                                                                                        : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                                                                                )}
                                                                                title={isPlayerOpen ? 'Đóng trình phát' : 'Xem đoạn trích'}
                                                                                type='button'
                                                                            >
                                                                                <Play className={cn('w-3.5 h-3.5 fill-current ml-0.5', isPlayerOpen && 'animate-pulse')} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className='text-[12px] font-bold text-slate-800 line-clamp-2 leading-relaxed'>
                                                                        {source.title || `Đoạn ${idx + 1}`}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <Collapsible open={isPlayerOpen}>
                                                                <CollapsibleContent>
                                                                    <div className='animate-in fade-in slide-in-from-top-2 duration-300'>
                                                                        <RemediationVideoPlayer
                                                                            lessonId={lessonId}
                                                                            chunk={chunk}
                                                                            subtitlesRaw={subtitlesRaw}
                                                                        />
                                                                    </div>
                                                                </CollapsibleContent>
                                                            </Collapsible>
                                                        </div>
                                                    )
                                                })}
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
