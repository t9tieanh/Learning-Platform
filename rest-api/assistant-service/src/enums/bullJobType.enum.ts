/**
 * Bull Job Queue Names Enum
 * 
 * Centralized definition of job queue and processor names
 * used throughout the AI analysis pipeline.
 */
export enum BullJobType {
    // Lesson analysis queues
    LESSON_CHUNKING = 'lesson-chunking',
    LESSON_SUMMARIZATION = 'lesson-summarization',
    LESSON_TEST_GROUP_QUIZ = 'lesson-test-group-quiz',
}
