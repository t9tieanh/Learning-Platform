import { useEffect, useRef, useState } from 'react'
import { X, Send, Bot, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import chatBotService from '@/services/chat-bot/ai.service'
import { CHATBOT_GREETING_MESSAGE, CHATBOT_ERROR_MESSAGE } from '@/constant'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'

import { ConversationMessage } from '@/types/ai'
import ChatBubbleSkeleton from './ChatBubbleSkeleton'
import useLoading from '@/hooks/useLoading.hook'

const bubbleMorphTimes = [0, 0.16, 0.32, 0.5, 0.66, 0.82, 1]

const bubbleMorphRadiusFlow = [
  '50% 50% 50% 50% / 50% 50% 50% 50%',
  '57% 43% 59% 41% / 45% 41% 59% 55%',
  '64% 36% 60% 40% / 34% 30% 70% 66%',
  '54% 46% 52% 48% / 52% 49% 51% 48%',
  '48% 52% 49% 51% / 53% 52% 48% 47%',
  '30% 30% 36% 36% / 24% 24% 44% 44%',
  '50% 50% 50% 50% / 50% 50% 50% 50%'
]

const bubbleMorphMainColors = [
  '#3B82F6', // blue-500
  '#4C8EF7',
  '#5A9AF7',
  '#4AA6F7',
  '#38BDF8',
  '#2EC8F2',
  '#22D3EE',
  '#28D1DA',
  '#2DD4BF',
  '#26CEC0',
  '#20C7C0',
  '#1EC4BA',
  '#19C2B4', // teal Learnova
  '#1EC4BA',
  '#20C7C0',
  '#26CEC0',
  '#2DD4BF',
  '#28D1DA',
  '#22D3EE',
  '#2EC8F2',
  '#38BDF8',
  '#4AA6F7',
  '#5A9AF7',
  '#4C8EF7',
  '#3B82F6'  // back to blue-500
]

const bubbleMorphGlowColors = [
  'rgba(59, 130, 246, 0.32)',
  'rgba(59, 130, 246, 0.42)',
  'rgba(139, 92, 246, 0.46)',
  'rgba(99, 102, 241, 0.4)',
  'rgba(56, 189, 248, 0.42)',
  'rgba(59, 130, 246, 0.46)',
  'rgba(59, 130, 246, 0.32)'
]

const bubbleMorphShadowFlow = [
  '0 10px 30px rgba(37, 99, 235, 0.45)',
  '0 12px 34px rgba(56, 119, 241, 0.48)',
  '0 14px 38px rgba(129, 140, 248, 0.52)',
  '0 12px 35px rgba(109, 143, 241, 0.5)',
  '0 13px 36px rgba(74, 144, 244, 0.5)',
  '0 16px 40px rgba(59, 130, 246, 0.54)',
  '0 10px 30px rgba(37, 99, 235, 0.45)'
]

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isBubbleHovered, setIsBubbleHovered] = useState(false)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [welcomed, setWelcomed] = useState(false)
  const { loading: isHistoryLoading, startLoading, stopLoading } = useLoading()
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userText = input.trim()
    const userMessage: ConversationMessage = { type: 'human', content: userText }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    // Show assistant typing placeholder
    setMessages((prev) => [...prev, { type: 'ai', content: 'typing...' }])

    try {
      const data = await chatBotService.requestToChat(userText)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1].content = data.result?.reply || CHATBOT_ERROR_MESSAGE
        return updated
      })
    } catch (err: any) {
      const fallback = CHATBOT_ERROR_MESSAGE
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1].content = fallback
        return updated
      })
    } finally {
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    if (!isOpen) return
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [messages, isOpen])

  // Load existing conversation history when opening the chat
  useEffect(() => {
    const loadHistory = async () => {
      if (!isOpen || messages.length > 0) return
      startLoading()
      try {
        const data = await chatBotService.loadConversation()
        if (data && data.result && data.result.length) {
          setMessages(data.result)
          setWelcomed(true) // prevent greeting if history exists
        }
      } catch (e) {
        console.warn('Cannot load conversation history', e)
      } finally {
        stopLoading()
      }
    }
    loadHistory()
  }, [isOpen, messages.length])

  // Auto-send a welcome message from AI on first open when empty
  useEffect(() => {
    if (!isOpen || welcomed || messages.length > 0 || isHistoryLoading) return
    setWelcomed(true)
    const greeting = CHATBOT_GREETING_MESSAGE
    setMessages((prev) => [...prev, { type: 'ai', content: greeting }])
  }, [isOpen, welcomed, messages.length, isHistoryLoading])

  return (
    <div className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]'>
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className='relative h-14 w-14 sm:h-16 sm:w-16'
                    onHoverStart={() => setIsBubbleHovered(true)}
                    onHoverEnd={() => setIsBubbleHovered(false)}
                    onFocusCapture={() => setIsBubbleHovered(true)}
                    onBlurCapture={() => setIsBubbleHovered(false)}
                    animate={{ scale: isBubbleHovered ? 1.08 : 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.6 }}
                  >
                    <Button
                      onClick={() => setIsOpen(true)}
                      aria-label='Mở Nova Copilot'
                      variant='ghost'
                      size='lg'
                      className='relative z-10 h-14 w-14 sm:h-16 sm:w-16 bg-transparent hover:bg-transparent focus-visible:bg-transparent flex items-center justify-center active:scale-95 border-0 shadow-none overflow-visible rounded-full focus-visible:ring-0 focus-visible:ring-offset-0'
                    >
                      <motion.div
                        className='absolute inset-0'
                        animate={
                          isBubbleHovered
                            ? {
                              borderRadius: bubbleMorphRadiusFlow,
                              rotate: [0, -2, 1, -1, 1.5, 0.5, 0],
                              scale: [1, 1.02, 1.01, 1.03, 1.02, 1.04, 1],
                              backgroundColor: bubbleMorphMainColors,
                              boxShadow: bubbleMorphShadowFlow
                            }
                            : {
                              borderRadius: '9999px',
                              rotate: 0,
                              scale: 1,
                              backgroundColor: '#2f95f8',
                              boxShadow: '0 10px 30px rgba(37, 99, 235, 0.45)'
                            }
                        }
                        transition={
                          isBubbleHovered
                            ? {
                              duration: 4.8,
                              times: bubbleMorphTimes,
                              ease: 'linear',
                              repeat: Infinity
                            }
                            : { duration: 0.45, ease: 'easeOut' }
                        }
                      />

                      <motion.div
                        className='pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.32),transparent_45%)]'
                        animate={
                          isBubbleHovered
                            ? {
                              opacity: [0.65, 0.92, 0.76, 0.88, 0.7],
                              borderRadius: bubbleMorphRadiusFlow
                            }
                            : {
                              opacity: 0.65,
                              borderRadius: '9999px'
                            }
                        }
                        transition={
                          isBubbleHovered
                            ? {
                              duration: 2.1,
                              ease: 'easeInOut',
                              repeat: Infinity
                            }
                            : { duration: 0.35, ease: 'easeOut' }
                        }
                      />

                      <motion.div
                        className='relative z-10'
                        animate={
                          isBubbleHovered
                            ? {
                              scale: [1, 0.96, 1.08, 1],
                              rotate: [0, -4, 3, 0],
                              opacity: [1, 0.9, 1]
                            }
                            : { scale: 1, rotate: 0, opacity: 1 }
                        }
                        transition={
                          isBubbleHovered
                            ? {
                              duration: 1.6,
                              ease: 'easeInOut',
                              repeat: Infinity
                            }
                            : { duration: 0.3, ease: 'easeOut' }
                        }
                      >
                        <Sparkles className='h-7 w-7 sm:h-8 sm:w-8 text-white fill-white' />
                      </motion.div>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className='bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-xl' side='left' sideOffset={15}>
                  Chào bạn! Tôi là Nova trợ giúp
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className='fixed inset-0 sm:inset-auto sm:relative flex flex-col items-end'
          >
            <Card className='w-full h-full sm:w-[420px] sm:h-[650px] flex flex-col overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-0 md:border border-white/10 sm:rounded-[2.5rem] bg-white/95 backdrop-blur-xl animate-none !py-0'>
              {/* Modern Header - Synced with HighGlossBackground */}
              <div className='bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950 text-white px-6 py-8 flex justify-between items-center relative overflow-hidden shrink-0'>
                <div className='absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#ffffff,transparent)] pointer-events-none' />
                <div className='absolute bottom-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -mr-16 -mt-16 blur-2xl animate-pulse' />
                <div className='absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full -ml-12 -mb-12 blur-2xl' />

                <div className='flex items-center gap-4 relative z-10'>
                  <div className='w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner'>
                    <Bot className='h-6 w-6 text-white' />
                  </div>
                  <div className='flex flex-col'>
                    <h3 className='font-black text-lg tracking-tight'>Nova Copilot</h3>
                    <div className='flex items-center gap-1.5'>
                      <span className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
                      <span className='text-[10px] uppercase font-black tracking-widest text-white/70'>Đang trực tuyến</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsOpen(false)}
                  className='text-white hover:bg-white/10 rounded-2xl h-10 w-10 p-0 transition-all active:scale-90 relative z-10'
                >
                  <X className='h-6 w-6' />
                </Button>
              </div>

              {/* Chat Area - Fixed with standard overflow for reliability */}
              <div className='flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-white to-blue-50/30 px-6'>
                <div className='space-y-6 py-6'>
                  {isHistoryLoading && <ChatBubbleSkeleton />}

                  {!isHistoryLoading && messages.length === 0 && (
                    <div className='h-[300px] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-1000'>
                      <div className='w-20 h-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-500 mb-2'>
                        <Sparkles className='h-10 w-10 animate-pulse' />
                      </div>
                      <div className='space-y-2'>
                        <h4 className='font-bold text-gray-800 italic'>Tôi có thể giúp gì cho lộ trình của bạn?</h4>
                        <p className='text-xs text-gray-400 max-w-[200px] mx-auto'>Hãy thử đặt một câu hỏi về nội dung bài học bất kỳ nhé!</p>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {!isHistoryLoading &&
                      messages.map((message, idx) => {
                        const isUser = message.type === 'human'
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            key={idx}
                            className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isUser && (
                              <div className='w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-1 shadow-sm'>
                                <Bot className='h-4 w-4 text-gray-400' />
                              </div>
                            )}
                            <div
                              className={`relative max-w-[85%] px-4 py-3 text-[14px] leading-relaxed shadow-sm transition-all ${isUser
                                ? 'bg-[#3a7bd5] text-white rounded-[1.5rem] rounded-tr-none shadow-blue-200/50'
                                : 'bg-white text-gray-700 border border-gray-100 rounded-[1.5rem] rounded-tl-none font-medium'
                                }`}
                            >
                              {message.content === 'typing...' ? (
                                <div className='flex items-center gap-1.5 py-1 px-2'>
                                  <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className='h-1.5 w-1.5 rounded-full bg-blue-400' />
                                  <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className='h-1.5 w-1.5 rounded-full bg-blue-400' />
                                  <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className='h-1.5 w-1.5 rounded-full bg-blue-400' />
                                </div>
                              ) : (
                                <div className='react-markdown-container'>
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                              )}
                            </div>
                            {isUser && (
                              <div className='w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-1 shadow-sm'>
                                <User className='h-4 w-4 text-blue-400' />
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                  </AnimatePresence>
                  <div ref={bottomRef} className='h-4' />
                </div>
              </div>

              {/* Input Area */}
              <div className='p-6 bg-white border-t border-gray-100 shrink-0'>
                <div className='flex gap-3 items-center bg-gray-50 p-2 rounded-[2rem] border border-gray-100 group-focus-within:border-blue-400 transition-all'>
                  <Input
                    placeholder='Hỏi Nova bất cứ điều gì...'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className='flex-1 !bg-transparent !border-none !shadow-none !ring-0 !text-[14px] !py-6 font-semibold italic placeholder:text-gray-300'
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    size='icon'
                    className='h-12 w-12 rounded-[1.2rem] bg-gradient-to-r from-[#00D2FF] to-[#3a7bd5] hover:scale-105 active:scale-90 transition-all shadow-lg shadow-blue-200'
                  >
                    <Send className='h-5 w-5' />
                  </Button>
                </div>
                <p className='text-[10px] text-gray-300 text-center mt-4 font-black uppercase tracking-[0.2em]'>
                  Nova copilot
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatBubble
