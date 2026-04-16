import { useState } from 'react'
import { motion, easeOut } from 'framer-motion'
import { Cpu, BookOpen, Sparkles, PlayCircle, Send, UsersRound } from 'lucide-react'
import heroStudents from '@/assets/images/hero.png'
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

const statsCards = [
  {
    value: '5K+',
    label: 'Online Courses',
    icon: PlayCircle,
    className: '-right-1 top-0 sm:right-4'
  },
  {
    value: '2K+',
    label: 'Video Courses',
    icon: Send,
    className: '-left-2 top-[44%] sm:-left-10'
  },
  {
    value: '250+',
    label: 'Tutors',
    icon: UsersRound,
    className: 'bottom-5 right-0 sm:right-5'
  }
]

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
    <section className='relative overflow-hidden bg-slate-100'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_90%_80%,rgba(96,165,250,0.1),transparent_34%)]' />
      <div className='absolute -left-20 top-16 h-[520px] w-[520px] rounded-full border border-blue-200/60' />
      <div className='absolute left-12 top-36 h-[380px] w-[380px] rounded-full border border-blue-100/90' />
      <div className='absolute -bottom-32 right-20 h-[340px] w-[340px] rounded-full border border-blue-100/90' />

      <div className='container relative mx-auto flex min-h-[680px] flex-col items-center gap-10 px-6 py-16 lg:flex-row lg:gap-14 lg:py-24'>
        <motion.div
          className='flex flex-1 flex-col items-start gap-7'
          variants={container}
          initial='hidden'
          animate='show'
        >
          <motion.span
            className='inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600'
            variants={item}
          >
            Nền tảng học tập Learnova
          </motion.span>

          <motion.h1
            className='max-w-3xl text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-[3.5rem]'
            variants={item}
          >
            Khai Mở <span className='text-blue-500'>Tri Thức</span>
            <br />
            Vững Bước <span className='text-blue-500'>Tương Lai</span>
          </motion.h1>

          <motion.p className='max-w-xl text-lg leading-relaxed text-slate-600' variants={item}>
            Trải nghiệm nền tảng học tập trực tuyến cho thế hệ mới, sự kết hợp của kiến thức và công nghệ hiện đại để
            bạn luôn dẫn đầu
          </motion.p>

          <motion.div className='mt-2 flex flex-wrap items-center gap-4' variants={item}>
            <CustomButton
              className='h-14 rounded-xl bg-blue-500 px-8 text-base font-bold text-white shadow-xl shadow-blue-500/35 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-500/45'
              label='Khám phá ngay'
              onClick={() => setOpen(true)}
              icon={<Send className='h-5 w-5' />}
              iconPosition='right'
            />
            <ExplorePreferencesModal open={open} onOpenChange={setOpen} onSave={handleSave} />
          </motion.div>

          <motion.div className='mt-5 flex flex-wrap items-center gap-7 text-slate-600' variants={item}>
            <span className='inline-flex items-center gap-2 text-base'>
              <Cpu className='h-5 w-5 text-blue-500' />
              Công nghệ
            </span>
            <span className='inline-flex items-center gap-2 text-base'>
              <BookOpen className='h-5 w-5 text-blue-500' />
              Tri thức
            </span>
            <span className='inline-flex items-center gap-2 text-base'>
              <Sparkles className='h-5 w-5 text-blue-500' />
              Đổi mới
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          className='flex w-full flex-1 items-center justify-center'
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: easeOut, delay: 0.4 }}
        >
          <div className='relative h-[440px] w-full max-w-[500px] sm:h-[520px]'>
            <div className='absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-200 sm:h-[500px] sm:w-[500px]' />
            <div className='absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 sm:h-[450px] sm:w-[450px]' />

            {statsCards.map((card, index) => {
              const Icon = card.icon

              return (
                <motion.div
                  key={card.label}
                  className={`absolute z-20 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${card.className}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: easeOut, delay: 0.55 + index * 0.2 }}
                >
                  <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500'>
                    <Icon className='h-5 w-5' />
                  </span>
                  <span>
                    <span className='block text-3xl font-extrabold leading-none text-slate-900'>{card.value}</span>
                    <span className='mt-1 block text-base leading-none text-slate-500'>{card.label}</span>
                  </span>
                </motion.div>
              )
            })}

            <img
              src={heroStudents}
              alt='Student learning with Learnova'
              width={1024}
              height={1024}
              className='absolute bottom-0 left-1/2 z-10 w-[82%] max-w-md -translate-x-1/2 drop-shadow-2xl'
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export { Banner }
