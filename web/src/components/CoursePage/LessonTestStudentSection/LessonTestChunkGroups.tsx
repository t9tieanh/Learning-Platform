import React from 'react'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import type {
  LessonTestSubmissionItem,
  LessonTestSubmissionResult,
  StudentChunkGroup,
} from '@/types/lesson-test-student.type'
import { LessonTestQuestionCard } from './LessonTestQuestionCard'

export interface LessonTestChunkGroupsProps {
  chunkGroups: StudentChunkGroup[]
  answers: Record<string, string[]>
  setChoice: (quizId: string, choiceId: string) => void
  result: LessonTestSubmissionResult | null
  resultByQuizId: Map<string, LessonTestSubmissionItem>
  showAnswerKey?: boolean
  flaggedIds: Record<string, boolean>
  toggleFlag: (quizId: string) => void
  onSeek?: (timestamp: string) => void
  chunks?: import('@/types/ai').LessonChunk[]
  lessonId: string
  lessonType?: 'video' | 'article'
  subtitlesRaw?: string | null
}

export const LessonTestChunkGroups: React.FC<LessonTestChunkGroupsProps> = ({
  chunkGroups,
  answers,
  setChoice,
  result,
  resultByQuizId,
  showAnswerKey = true,
  flaggedIds,
  toggleFlag,
  onSeek,
  chunks,
  lessonId,
  lessonType = 'video',
  subtitlesRaw,
}) => (
  <div className='space-y-8 md:space-y-10'>
    {chunkGroups.map((group, gIdx) => (
      <section key={group.id} className='space-y-4'>
        <HighGlossBackground className='rounded-xl shadow-sm shadow-blue-900/10 overflow-hidden'>
          <div className='px-4 py-3 flex flex-wrap items-center justify-between gap-2'>
            <div className='min-w-0'>
              <p className='text-[10px] font-bold uppercase tracking-wider text-blue-100/85 mb-0.5'>Phần {gIdx + 1}</p>
              <h4 className='text-white font-semibold text-[13px] leading-snug'>
                {group.label?.trim() || `Nội dung ${gIdx + 1}`}
              </h4>
            </div>
            <span className='text-[10px] font-bold uppercase tracking-wider text-blue-100/75 bg-white/10 border border-white/15 rounded-md px-2 py-1 shrink-0 tabular-nums'>
              {group.quizzes.length} câu
            </span>
          </div>
        </HighGlossBackground>

        <div className='space-y-4 border-l-2 border-blue-200/70 pl-3 md:pl-4 ml-1'>
          {group.quizzes.map((quiz, idx) => (
            <LessonTestQuestionCard
              key={quiz.id}
              quiz={quiz}
              gIdx={gIdx}
              qIdx={idx}
              answers={answers}
              setChoice={setChoice}
              locked={Boolean(result)}
              row={resultByQuizId.get(quiz.id)}
              showAnswerKey={showAnswerKey}
              flaggedIds={flaggedIds}
              toggleFlag={toggleFlag}
              onSeek={onSeek}
              chunks={chunks}
              lessonId={lessonId}
              lessonType={lessonType}
              subtitlesRaw={subtitlesRaw}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
)
