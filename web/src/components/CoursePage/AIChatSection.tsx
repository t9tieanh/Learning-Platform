import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Play, Loader2, Sparkles, Clock, TextQuote } from 'lucide-react'
import learnovaLogo from '@/assets/images/logo1.png'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import assistantAnalysisService, { RAGResult, RAGSource } from '@/services/assistant/analysis.service'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useAuthStore } from '@/stores/useAuth.stores'
import { PremiumLockedState } from './PremiumLockedState'

interface Message {
    role: 'user' | 'assistant'
    content: string
    sources?: RAGSource[]
    id: string
}

interface AIChatSectionProps {
    lessonId: string
    onSeek?: (timestamp: string) => void
}



export const AIChatSection: React.FC<AIChatSectionProps> = ({ lessonId, onSeek }) => {
    const { data: user } = useAuthStore()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    /** Server chat session — required for transcript + semantic recall on the assistant */
    const [chatSessionId, setChatSessionId] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setChatSessionId(null)
        setMessages([])
    }, [lessonId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return
        if (!lessonId || lessonId === 'undefined') {
            const warning: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Vui lòng chọn một bài học cụ thể để tôi có thể hỗ trợ bạn tốt nhất!'
            }
            setMessages((prev) => [...prev, warning])
            return
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
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
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.result.answer,
                    sources: response.result.sources
                }
                setMessages((prev) => [...prev, aiMessage])
            } else {
                // Handle non-200 codes (like 500)
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `[Lỗi ${response.code}]: ${response.message || 'Hệ thống đang gặp sự cố, vui lòng thử lại sau.'}`
                }
                setMessages((prev) => [...prev, errorMessage])
            }
        } catch (error) {
            console.error('Failed to get AI answer', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.'
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
            {/* Messages Area */}
            <div
                ref={scrollRef}
                className='flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-gray-100'
            >
                {messages.length === 0 ? (
                    <div className='h-full flex flex-col items-center justify-center text-center px-8 space-y-4'>
                        <div className='w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center p-3 shadow-inner'>
                            <img src={learnovaLogo} alt="Learnova" className='w-full h-full object-contain filter drop-shadow-sm' />
                        </div>
                        <div className='space-y-2'>
                            <h3 className='text-[15px] font-bold text-gray-800'>Hỏi đáp cùng trợ lý AI</h3>
                            <p className='text-[13px] text-gray-500 max-w-[280px] leading-relaxed'>
                                Đặt câu hỏi về nội dung bài giảng này. Tôi sẽ giúp bạn tìm câu trả lời từ video!
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
                            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {m.role === 'user' ? <User className='w-4 h-4' /> : <Bot className='w-4 h-4' />}
                                </div>
                                <div className='space-y-3'>
                                    <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed font-medium shadow-sm ${m.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
                                        }`}>
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
                                            <p className='text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2'>
                                                <Sparkles className='w-3 h-3 text-blue-400' /> Nguồn tham chiếu từ video
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
                                                                        {source.title || `Đoạn ${idx + 1}`}
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
                                                                onClick={() => onSeek?.(source.startTime || '0')}
                                                                className='w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shrink-0'
                                                                title="Tua ngay"
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
                                <span className='text-[13px] text-gray-500 font-medium italic'>Đang phân tích bài giảng...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className='p-4 border-t border-gray-100 bg-gray-50/50'>
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
                        placeholder="Hỏi AI bất cứ điều gì về bài giảng này..."
                        className='min-h-[48px] max-h-32 py-3 px-4 rounded-2xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 text-[14px] bg-white resize-none pr-12 transition-all shadow-sm'
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className='absolute right-2 bottom-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all h-9 w-9'
                    >
                        {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
                    </Button>
                </div>
                <p className='text-[10px] text-gray-400 mt-2 text-center font-medium'>
                    AI có thể nhầm lẫn. Vui lòng kiểm tra lại các nguồn tham chiếu được cung cấp.
                </p>
            </div>
        </div>
    )
}
