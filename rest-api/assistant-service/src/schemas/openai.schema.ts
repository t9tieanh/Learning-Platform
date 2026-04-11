/**
 * OpenAI Structured Outputs Schema
 * Defines JSON schemas for OpenAI API responses
 */

/**
 * Schema for a single quiz choice/answer
 */
export const QuizChoiceSchema = {
  type: 'object' as const,
  properties: {
    text: {
      type: 'string',
      description: 'The text of the answer choice',
    },
    isCorrect: {
      type: 'boolean',
      description: 'Whether this choice is the correct answer',
    },
    feedback: {
      type: 'string',
      description: 'Optional feedback for this choice',
    },
  },
  required: ['text', 'isCorrect'],
  additionalProperties: false,
};

/**
 * Schema for a single quiz question
 */
export const SingleQuizSchema = {
  type: 'object' as const,
  properties: {
    question: {
      type: 'string',
      description: 'The quiz question text',
    },
    choices: {
      type: 'array',
      description: 'Array of answer choices (exactly 4 required)',
      items: QuizChoiceSchema,
      minItems: 4,
      maxItems: 4,
    },
    explanation: {
      type: 'string',
      description: 'Detailed explanation of the correct answer and why others are wrong',
    },
    confidence: {
      type: 'number',
      description: 'Confidence score (0-1)',
      minimum: 0,
      maximum: 1,
    },
  },
  required: ['question', 'choices', 'explanation'],
  additionalProperties: false,
};

/**
 * Schema for batch quiz generation (array of quizzes)
 */
export const BatchQuizSchema = {
  type: 'object' as const,
  properties: {
    quizzes: {
      type: 'array',
      description: 'Array of generated quiz questions',
      items: SingleQuizSchema,
      minItems: 1,
    },
  },
  required: ['quizzes'],
  additionalProperties: false,
};

/**
 * JSON Schema type definitions for TypeScript
 */
export interface QuizChoice {
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface SingleQuiz {
  question: string;
  choices: QuizChoice[];
  explanation: string;
  confidence?: number;
}

export interface BatchQuiz {
  quizzes: SingleQuiz[];
}
