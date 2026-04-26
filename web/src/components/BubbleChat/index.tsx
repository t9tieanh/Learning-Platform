import { useEffect, useRef, useState } from 'react'
import { X, Send, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import chatBotService from '@/services/chat-bot/ai.service'
import { CHATBOT_GREETING_MESSAGE, CHATBOT_ERROR_MESSAGE } from '@/constant'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'

import { ConversationMessage } from '@/types/ai'
import chatboticImage from '@/assets/images/chatbotic.png'
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
  '#3B82F6' // back to blue-500
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

const messageMotion = {
  initial: { opacity: 0, y: 18, scale: 0.97, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
}

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isBubbleHovered, setIsBubbleHovered] = useState(false)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
  }, [isOpen, messages.length, startLoading, stopLoading])

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
                <TooltipContent
                  className='bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-xl'
                  side='left'
                  sideOffset={15}
                >
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
            <Card className='chatbot-shell relative h-full w-full overflow-hidden border-0 bg-white/92 !py-0 shadow-[0_28px_90px_-24px_rgba(37,99,235,0.28)] backdrop-blur-2xl sm:h-[min(720px,calc(100vh-3rem))] sm:w-[440px] sm:rounded-[2rem] sm:border sm:border-white/70'>
              <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(239,246,255,0.9))]' />
              <div className='pointer-events-none absolute inset-[1px] rounded-[inherit] border border-blue-100/80' />

              <div
                className='relative flex shrink-0 items-center justify-between overflow-hidden 
                  border-b border-blue-100/80 
                  bg-gradient-to-r from-teal-500 via-blue-600 to-teal-300 
                  bg-[length:200%_200%] 
                  animate-gradientWave
                  text-white px-5 py-5 sm:px-6 sm:py-6'
              >
                {' '}
                <div className='pointer-events-none absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_0%,rgba(96,165,250,0.22),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.65),transparent_50%)]' />
                <div className='pointer-events-none absolute -right-12 top-0 h-28 w-28 rounded-full bg-sky-200/40 blur-3xl' />
                <div className='pointer-events-none absolute -bottom-10 left-3 h-24 w-24 rounded-full bg-blue-200/45 blur-3xl' />
                <div className='flex items-center gap-4 relative z-10'>
                  <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.15rem] border border-blue-100 bg-white/90 shadow-[0_12px_28px_-16px_rgba(37,99,235,0.3)]'>
                    <img src={chatboticImage} alt='Chatbotic' className='h-8 w-8 object-contain sm:h-8 sm:w-8' />
                  </div>
                  <div className='flex flex-col'>
                    <h3 className='chatbot-heading text-lg font-bold tracking-tight'>Nova Copilot</h3>
                    <div className='flex items-center gap-2'>
                      <span className='text-[10px] font-black text-green-400/90 uppercase tracking-[0.26em]'>
                        online
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsOpen(false)}
                  className='relative z-10 h-10 w-10 rounded-2xl border border-blue-100 bg-white/80 p-0 text-slate-700 transition-all duration-300 hover:scale-105 hover:bg-blue-50 active:scale-95'
                >
                  <X className='h-6 w-6' />
                </Button>
              </div>

              <div className='relative flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-5 sm:pb-32 sm:pt-5'>
                <div className='pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-blue-50/90 to-transparent' />
                <div className='relative space-y-4 sm:space-y-5'>
                  {isHistoryLoading && <ChatBubbleSkeleton />}

                  {!isHistoryLoading && messages.length === 0 && (
                    <div className='flex h-[300px] flex-col items-center justify-center space-y-4 text-center animate-in fade-in duration-1000'>
                      <div className='mb-2 flex h-20 w-20 items-center justify-center overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_18px_45px_-25px_rgba(96,165,250,0.55)]'>
                        <img src={chatboticImage} alt='Chatbotic' className='h-12 w-12 object-contain' />
                      </div>
                      <div className='space-y-2'>
                        <h4 className='chatbot-heading text-base font-bold italic text-slate-800'>
                          Tôi có thể hỗ trợ gì cho lộ trình học của bạn?
                        </h4>
                        <p className='mx-auto max-w-[240px] text-xs leading-6 text-slate-500'>
                          Hãy thử đặt một câu hỏi về nội dung bài học hoặc nhờ tôi tóm tắt, giải thích, và gợi ý bước
                          tiếp theo.
                        </p>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {!isHistoryLoading &&
                      messages.map((message, idx) => {
                        const isUser = message.type === 'human'
                        return (
                          <motion.div
                            {...messageMotion}
                            key={idx}
                            className={`flex items-end gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isUser && (
                              <div className='mt-1 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_12px_30px_-18px_rgba(96,165,250,0.45)]'>
                                <img src={chatboticImage} alt='Chatbotic' className='h-5 w-5 object-contain' />
                              </div>
                            )}
                            <div
                              className={`group relative max-w-[86%] rounded-[1.6rem] px-4 py-3 text-[14px] leading-7 transition-all duration-300 sm:max-w-[82%] sm:px-5 sm:py-3.5 ${isUser
                                  ? 'rounded-br-md border border-blue-300/30 bg-[linear-gradient(135deg,rgba(59,130,246,0.95),rgba(29,78,216,0.92))] text-white shadow-[0_18px_40px_-20px_rgba(59,130,246,0.9)]'
                                  : 'rounded-bl-md border border-blue-100 bg-white text-slate-700 shadow-[0_18px_40px_-26px_rgba(37,99,235,0.18)]'
                                }`}
                            >
                              <div
                                className={`pointer-events-none absolute inset-0 rounded-[inherit] opacity-70 transition-opacity duration-300 group-hover:opacity-100 ${isUser
                                    ? 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_38%)]'
                                    : 'bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_42%)]'
                                  }`}
                              />
                              {message.content === 'typing...' ? (
                                <div className='relative flex items-center gap-1.5 px-1 py-1'>
                                  <motion.span
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.45, 1, 0.45] }}
                                    transition={{ repeat: Infinity, duration: 0.9 }}
                                    className='h-2 w-2 rounded-full bg-sky-300'
                                  />
                                  <motion.span
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.45, 1, 0.45] }}
                                    transition={{ repeat: Infinity, duration: 0.9, delay: 0.2 }}
                                    className='h-2 w-2 rounded-full bg-sky-300'
                                  />
                                  <motion.span
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.45, 1, 0.45] }}
                                    transition={{ repeat: Infinity, duration: 0.9, delay: 0.4 }}
                                    className='h-2 w-2 rounded-full bg-sky-300'
                                  />
                                </div>
                              ) : (
                                <div
                                  className={`react-markdown-container chatbot-body relative ${isUser ? 'chat-markdown-user' : 'chat-markdown-bot'
                                    }`}
                                >
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                              )}
                            </div>
                            {isUser && (
                              <div className='mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-blue-200/70 bg-blue-50 shadow-[0_12px_30px_-18px_rgba(59,130,246,0.35)]'>
                                <User className='h-4 w-4 text-blue-600' />
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                  </AnimatePresence>
                  <div ref={bottomRef} className='h-4' />
                </div>
              </div>

              <div className='absolute inset-x-0 bottom-0 z-10 border-t border-blue-100/80 bg-white/88 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-2xl sm:px-5'>
                <div className='rounded-[1.75rem] border border-blue-100 bg-white/95 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_-26px_rgba(96,165,250,0.28)] backdrop-blur-xl transition-all duration-300 focus-within:border-blue-300/60 focus-within:shadow-[0_18px_40px_-26px_rgba(59,130,246,0.35)]'>
                  <div className='flex items-center gap-2 sm:gap-3'>
                    <Input
                      placeholder='Nhập tin nhắn...'
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className='chatbot-body min-h-[52px] flex-1 !border-none !bg-transparent !px-4 !py-4 !text-[14px] !font-semibold !text-slate-700 !shadow-none !ring-0 placeholder:!text-slate-400/80'
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      size='icon'
                      className='group h-12 w-12 shrink-0 rounded-[1.15rem] border border-blue-200/20 bg-[linear-gradient(135deg,#38bdf8,#2563eb)] text-white shadow-[0_16px_32px_-18px_rgba(56,189,248,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-16px_rgba(56,189,248,1)] active:translate-y-0 active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0'
                    >
                      <Send className='h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
                    </Button>
                  </div>
                </div>
                <p className='chatbot-heading mt-3 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400/70'>
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
