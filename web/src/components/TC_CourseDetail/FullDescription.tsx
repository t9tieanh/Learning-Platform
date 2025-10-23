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
      className='rounded-xl bg-card p-6 shadow-md'
    >
      <h2 className='text-xl font-bold mb-6'>Mô tả chi tiết</h2>
      <div
        className='prose prose-sm max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-3 prose-p:leading-relaxed prose-ul:list-disc prose-ul:pl-6 prose-li:my-1'
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </motion.div>
  )
}
