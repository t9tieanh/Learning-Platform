import { useState } from 'react'
import { motion, easeOut } from 'framer-motion'
import { Cpu, BookOpen, Sparkles, Send, MonitorPlay, UserCog } from 'lucide-react'
import heroStudents from '@/assets/images/hero3.png'
import CustomButton from '@/components/common/Button'
import HighGlossBackground from '@/components/common/HighGlossBackground'
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
    label: 'Học mọi lúc, mọi nơi',
    icon: MonitorPlay, // học online
    className: '-right-1 top-0 sm:right-4'
  },
  {
    label: 'Trải nghiệm cá nhân hóa',
    icon: UserCog, // personalization
    className: 'bottom-5 right-0 sm:right-5'
  },
  {
    label: 'AI hỗ trợ thông minh',
    icon: Sparkles, // AI / smart features
    className: '-left-2 top-[44%] sm:-left-10'
  }
]

const waveRings = [
  {
    id: 'wave-ring-1',
    className: 'h-[510px] w-[510px] sm:h-[580px] sm:w-[580px]',
    delay: 0,
    fromScale: 0.84,
    opacity: 0.42
  },
  {
    id: 'wave-ring-2',
    className: 'h-[590px] w-[590px] sm:h-[680px] sm:w-[680px]',
    delay: 1,
    fromScale: 0.72,
    opacity: 0.32
  },
  {
    id: 'wave-ring-3',
    className: 'h-[670px] w-[670px] sm:h-[780px] sm:w-[780px]',
    delay: 2,
    fromScale: 0.64,
    opacity: 0.24
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
    <HighGlossBackground>
      <section className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.2),transparent_38%),radial-gradient(circle_at_90%_5%,rgba(125,211,252,0.22),transparent_30%)]' />
        <div className='absolute -left-20 top-16 h-[520px] w-[520px] rounded-full border border-white/20' />
        <div className='absolute left-12 top-36 h-[380px] w-[380px] rounded-full border border-blue-200/25' />
        <div className='absolute -bottom-32 right-20 h-[340px] w-[340px] rounded-full border border-blue-200/20' />

        <div className='container relative mx-auto flex min-h-[680px] flex-col items-center gap-10 px-6 py-16 lg:flex-row lg:gap-14 lg:py-24'>
          <motion.div
            className='flex flex-1 flex-col items-start gap-7'
            variants={container}
            initial='hidden'
            animate='show'
          >
            <motion.span
              className='inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100'
              variants={item}
            >
              Nền tảng học tập Learnova
            </motion.span>

            <motion.h1
              className='max-w-3xl text-3xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[3.5rem]'
              variants={item}
            >
              Khai Mở <span className='text-blue-300'>Tri Thức</span>
              <br />
              Vững Bước <span className='text-cyan-200'>Tương Lai</span>
            </motion.h1>

            <motion.p className='max-w-xl text-lg leading-relaxed text-blue-100/90' variants={item}>
              Trải nghiệm nền tảng học tập trực tuyến cho thế hệ mới, sự kết hợp của kiến thức và công nghệ hiện đại để
              bạn luôn dẫn đầu
            </motion.p>

            <motion.div className='mt-2 flex flex-wrap items-center gap-4' variants={item}>
              <CustomButton
                className='h-14 rounded-xl bg-white px-8 text-base font-bold text-blue-500 shadow-xl shadow-blue-950/35 transition-all hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-blue-950/50 hover:text-white'
                label='Khám phá ngay'
                onClick={() => setOpen(true)}
                icon={<Send className='h-5 w-5' />}
                iconPosition='right'
              />
              <ExplorePreferencesModal open={open} onOpenChange={setOpen} onSave={handleSave} />
            </motion.div>

            <motion.div className='mt-5 flex flex-wrap items-center gap-7 text-blue-100/90' variants={item}>
              <span className='inline-flex items-center gap-2 text-base'>
                <Cpu className='h-5 w-5 text-blue-300' />
                Công nghệ
              </span>
              <span className='inline-flex items-center gap-2 text-base'>
                <BookOpen className='h-5 w-5 text-blue-300' />
                Tri thức
              </span>
              <span className='inline-flex items-center gap-2 text-base'>
                <Sparkles className='h-5 w-5 text-blue-300' />
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
              {waveRings.map((ring) => (
                <motion.div
                  key={ring.id}
                  className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/45 ${ring.className}`}
                  initial={{ scale: ring.fromScale, opacity: 0 }}
                  animate={{ scale: [ring.fromScale, 1], opacity: [0, ring.opacity, 0] }}
                  transition={{ duration: 5.2, ease: easeOut, repeat: Infinity, delay: ring.delay }}
                />
              ))}
              <div className='absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/35 sm:h-[500px] sm:w-[500px]' />
              <div className='absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-900 sm:h-[450px] sm:w-[450px]' />

              {statsCards.map((card, index) => {
                const Icon = card.icon

                return (
                  <motion.div
                    key={card.label}
                    className={`absolute z-20 flex items-center gap-3 rounded-2xl border border-white/35 bg-white/95 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.2)] ${card.className}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: easeOut, delay: 0.55 + index * 0.2 }}
                  >
                    <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600'>
                      <Icon className='h-5 w-5' />
                    </span>
                    <span>
                      <span className='block text-base leading-none text-slate-600'>{card.label}</span>
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
    </HighGlossBackground>
  )
}

export { Banner }
