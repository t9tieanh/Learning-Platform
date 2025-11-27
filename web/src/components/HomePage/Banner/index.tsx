'use client'

import './style.scss'
import { Button } from '@/components/ui/button'
import { FaPaperPlane } from 'react-icons/fa'
import { motion, easeOut } from 'framer-motion'

const container = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.3,
      duration: 1.2,
      ease: easeOut
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOut
    }
  }
}

const Banner = () => {
  return (
    <div className='banner-container p-32'>
      <motion.div variants={container} initial='hidden' animate='show'>
        {' '}
        <div className="absolute inset-0 -z-10 bg-[url('/bg.jpg')] bg-cover" />
        <motion.h2 variants={item} className='text-2xl mt-32 flex items-center gap-2'>
          <motion.span
            animate={{ rotate: [0, 20, -10, 20, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
            style={{ display: 'inline-block', transformOrigin: '70% 70%' }}
          >
            👋
          </motion.span>
          Chào mừng bạn đến với Learnova
        </motion.h2>
        <motion.h1 className='scroll-m-20 text-4xl mt-4 font-extrabold tracking-tight text-start' variants={item}>
          Nền tảng học tập trực tuyến dành cho thế hệ mới
        </motion.h1>
        <motion.blockquote className='mt-6 border-l-2 pl-6 italic text-lg' variants={item}>
          &quot;Cùng công nghệ, học tập trở nên dễ dàng hơn.&quot;
        </motion.blockquote>
      </motion.div>
    </div>
  )
}

export { Banner }
