'use client'

import './style.scss'
import CustomButton from '@/components/common/Button'
import { motion, easeOut } from 'framer-motion'
import { Send } from 'lucide-react'
import { useState } from 'react'
import ExplorePreferencesModal, { type ExplorePreferencesPayload } from '@/components/HomePage/ExplorePreferencesModal'

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

type BannerProps = {
  onPreferencesSaved?: () => void
}

const Banner = ({ onPreferencesSaved }: BannerProps) => {
  const [open, setOpen] = useState(false)

  const handleSave = (payload: ExplorePreferencesPayload) => {
    console.log(JSON.stringify(payload, null, 2))
    onPreferencesSaved?.()
  }

  return (
    <div className='banner-container p-32'>
      <div className='pl-28'>
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
          <motion.h1 className='scroll-m-20 text-4xl mt-4 font-extrabold tracking-tight text-start max-w-4xl leading-[1.1]' variants={item}>
            Nền tảng học tập trực tuyến hàng đầu để kiến tạo sự nghiệp tương lai cho thế hệ mới
          </motion.h1>
          <motion.blockquote className='mt-6 border-l-2 pl-6 italic text-lg' variants={item}>
            &quot;Cùng công nghệ, học tập trở nên dễ dàng hơn.&quot;
          </motion.blockquote>
        </motion.div>
        <CustomButton
          className='mt-12 !px-8 !py-6 rounded-[2rem] bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-black tracking-tight shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 hover:scale-[1.02] transition-all group'
          label='Khám phá ngay'
          onClick={() => setOpen(true)}
          icon={<Send className='w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform' />}
        />
        <ExplorePreferencesModal open={open} onOpenChange={setOpen} onSave={handleSave} />
      </div>
    </div>
  )
}

export { Banner }
