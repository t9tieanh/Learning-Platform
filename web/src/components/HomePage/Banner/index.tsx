import { useState } from 'react'
import { motion, easeOut } from 'framer-motion'
import { Send } from 'lucide-react'
import heroStudents from '@/assets/images/hero.png'
import logo from '@/assets/images/logo.png'
import CustomButton from '@/components/common/Button'
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
    <section className='relative min-h-[600px] overflow-hidden bg-banner'>
      {/* Background gradient blob */}
      <div className='absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-[#2dd4bf]/20 to-[#3b82f6]/10 blur-3xl' />
      <div className='absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-[#2dd4bf]/20 to-[#3b82f6]/10 blur-3xl' />

      <div className='container relative mx-auto flex flex-col items-center gap-8 px-6 py-16 lg:flex-row lg:gap-12 lg:py-24'>
        {/* Left content */}
        <motion.div
          className='flex flex-1 flex-col items-start gap-6'
          variants={container}
          initial='hidden'
          animate='show'
        >
          <motion.h1
            className='text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]'
            variants={item}
          >
            Sẵn sàng học hỏi?{' '}
            <span className='bg-gradient-to-r from-[#2dd4bf] to-[#3b82f6] bg-clip-text text-transparent'>
              Bắt đầu hành trình
            </span>{' '}
            cùng chúng tôi.
          </motion.h1>

          <motion.p className='max-w-lg text-lg leading-relaxed text-muted-foreground' variants={item}>
            Chúng tôi tin rằng mỗi người đều xứng đáng có cơ hội phát triển thông qua công nghệ — kiến tạo kỹ năng và sự
            nghiệp tương lai.
          </motion.p>

          <motion.div variants={item}>
            <CustomButton
              className='mt-10 md:mt-12 !px-8 !py-6 rounded-[1rem] bg-gradient-to-r from-[#2dd4bf] to-[#3b82f6] text-white font-black tracking-tight shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 hover:scale-[1.01] transition-all group'
              label='Khám phá ngay'
              onClick={() => setOpen(true)}
              icon={
                <Send className='w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform' />
              }
            />
            <ExplorePreferencesModal open={open} onOpenChange={setOpen} onSave={handleSave} />
          </motion.div>
        </motion.div>

        {/* Right image */}
        <motion.div
          className='flex flex-1 items-center justify-center'
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: easeOut, delay: 0.4 }}
        >
          <img
            src={heroStudents}
            alt='Học viên đang háo hức học tập với Learnova'
            width={1024}
            height={1024}
            className='w-full max-w-lg drop-shadow-2xl'
          />
        </motion.div>
      </div>
    </section>
  )
}

export { Banner }
