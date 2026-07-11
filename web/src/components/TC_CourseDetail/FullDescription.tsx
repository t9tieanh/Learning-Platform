import { motion } from 'framer-motion'

interface FullDescriptionProps {
  description: string
}

export function FullDescription({ description }: FullDescriptionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className='relative isolate overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.09)]'
    >
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-12 bg-gradient-to-r from-indigo-100/70 via-sky-100/45 to-transparent' />
      <h2 className='mb-5 text-lg font-semibold tracking-tight text-slate-900'>Mô tả chi tiết</h2>
      <div
        className='prose prose-sm max-w-none text-sm text-slate-700 prose-headings:font-semibold prose-h2:mb-4 prose-h2:mt-6 prose-h3:mb-3 prose-h3:mt-4 prose-h3:text-base prose-li:my-1 prose-p:leading-relaxed prose-strong:text-indigo-700 prose-ul:list-disc prose-ul:pl-6'
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </motion.div>
  )
}
