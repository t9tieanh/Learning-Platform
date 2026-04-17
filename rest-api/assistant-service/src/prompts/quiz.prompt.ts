/**
 * Prompts used by QuizGenerationService for AI-powered quiz generation.
 *
 * These prompts are optimized for:
 * - Generating high-quality multiple-choice questions
 * - Context-aware generation with lesson and chunk summaries
 * - Structured JSON output for easy parsing
 * - Educational best practices (Bloom's taxonomy alignment)
 * - Reducing ambiguity in answer choices
 * - Multi-language support (English and Vietnamese)
 */

export type QuizLanguage = 'en' | 'vi';

export const QuizPrompts = {
  /**
   * System prompt for single quiz generation (English)
   * Guides the LLM on educational quality and format requirements
   */
  singleSystem: () =>
    'You are an expert educational content creator specializing in generating high-quality multiple-choice quiz questions. ' +
    'Your task is to create quiz questions that test deep understanding and critical thinking, aligned with Bloom\'s taxonomy. ' +
    '\n\nREQUIREMENTS:\n' +
    '1. The question must be clear, concise, and test understanding of the core concept\n' +
    '2. Provide exactly 4 answer choices (only one correct)\n' +
    '3. The correct answer must be unambiguous and well-supported by the content\n' +
    '4. Incorrect options should be plausible but clearly distinguishable from the correct answer\n' +
    '5. Include a detailed explanation of why the correct answer is right and why others are wrong\n' +
    '6. Format output as valid JSON (no markdown formatting, code fences, or extra text)\n' +
    '\n' +
    'You MUST respond with a strictly valid JSON object only.\n' +
    'Do NOT include markdown, code fences, comments, explanations, or extra text.\n' +
    'The response must be directly parseable JSON.',

  /**
   * System prompt for single quiz generation (Vietnamese)
   * Guides the LLM on educational quality and format requirements in Vietnamese
   */
  singleSystemVi: () =>
    'Bạn là một chuyên gia tạo nội dung giáo dục, chuyên biệt trong việc tạo các câu hỏi trắc nghiệm chất lượng cao. ' +
    'Nhiệm vụ của bạn là tạo các câu hỏi quiz kiểm tra sự hiểu biết sâu sắc và tư duy phản biện, phù hợp với phân loại Bloom. ' +
    '\n\n**QUAN TRỌNG: TẤT CẢ NỘI DUNG PHẢI ĐƯỢC VIẾT BẰNG TIẾNG VIỆT. KHÔNG DÙNG TIẾNG ANH.**' +
    '\n\nYÊU CẦU:\n' +
    '1. Câu hỏi phải rõ ràng, ngắn gọn và kiểm tra sự hiểu biết của khái niệm cốt lõi\n' +
    '2. Cung cấp chính xác 4 lựa chọn trả lời (chỉ có một đáp án đúng)\n' +
    '3. Đáp án đúng phải rõ ràng và được hỗ trợ tốt bởi nội dung\n' +
    '4. Các lựa chọn sai phải có khả năng nhưng phân biệt rõ ràng với đáp án đúng\n' +
    '5. Đưa ra giải thích chi tiết về lý do đáp án đúng là đúng và tại sao các đáp án khác là sai\n' +
    '6. Định dạng kết quả dưới dạng JSON hợp lệ (không có markdown, code fences hoặc văn bản bổ sung)\n' +
    '\n' +
    'BẠN PHẢI trả lời bằng một đối tượng JSON hoàn toàn hợp lệ.\n' +
    'KHÔNG bao gồm markdown, code fences, nhận xét, giải thích hoặc văn bản bổ sung.\n' +
    'Phản hồi phải có thể phân tích cú pháp JSON trực tiếp.\n' +
    '**LƯU Ý: VIẾT TẤT CẢ BẰNG TIẾNG VIỆT, BẢO GỒM CÂU HỎI, ĐÁP ÁN, VÀ GIẢI THÍCH.**',

  /**
   * User prompt template for single quiz generation (English)
   * Substitutes: {lessonSummary}, {chunkSummary}, {chunkContent}, {difficulty}, {bloomLevel}
   */
  singleUser: () =>
    'Based on the following lesson and chunk context, generate a high-quality multiple-choice question.\n\n' +
    'LESSON OVERVIEW:\n' +
    '{lessonSummary}\n\n' +
    'CHUNK TOPIC:\n' +
    '{chunkSummary}\n\n' +
    'CHUNK CONTENT:\n' +
    '{chunkContent}\n\n' +
    'QUESTION REQUIREMENTS:\n' +
    '- Difficulty Level: {difficulty} (EASY: simple recall, MEDIUM: requires understanding, HARD: critical thinking)\n' +
    '- Bloom\'s Taxonomy Level: {bloomLevel}\n' +
    '  * REMEMBER: recall facts and basic concepts\n' +
    '  * UNDERSTAND: explain concepts and ideas\n' +
    '  * APPLY: use information in new situations\n' +
    '  * ANALYZE: break down information into components\n' +
    '  * EVALUATE: make judgments based on criteria\n' +
    '  * CREATE: combine elements to produce something new\n' +
    '- Question Type: Multiple-choice with 4 options\n' +
    '- Ensure alignment with the lesson objectives and chunk content\n\n' +
    'RESPONSE FORMAT (Strictly valid JSON):\n' +
    '{\n' +
    '  "question": "The clear, specific question text",\n' +
    '  "choices": [\n' +
    '    { "text": "Correct answer", "isCorrect": true },\n' +
    '    { "text": "Plausible wrong answer 1", "isCorrect": false },\n' +
    '    { "text": "Plausible wrong answer 2", "isCorrect": false },\n' +
    '    { "text": "Plausible wrong answer 3", "isCorrect": false }\n' +
    '  ],\n' +
    '  "explanation": "Detailed explanation of the correct answer and why others are incorrect",\n' +
    '  "confidence": 0.95\n' +
    '}\n\n' +
    'Generate the question now:',

  /**
   * User prompt template for single quiz generation (Vietnamese)
   * Substitutes: {lessonSummary}, {chunkSummary}, {chunkContent}, {difficulty}, {bloomLevel}
   */
  singleUserVi: () =>
    '**VIẾT TẤT CẢ NỘI DUNG BẰNG TIẾNG VIỆT. KHÔNG DÙNG TIẾNG ANH BẠT CỬ NÀO.**\n\n' +
    'Dựa trên ngữ cảnh bài học và phần sau đây, hãy tạo một câu hỏi trắc nghiệm chất lượng cao HOÀN TOÀN BẰNG TIẾNG VIỆT.\n\n' +
    'TỔNG QUAN BÀI HỌC:\n' +
    '{lessonSummary}\n\n' +
    'CHỦ ĐỀ PHẦN:\n' +
    '{chunkSummary}\n\n' +
    'NỘI DUNG PHẦN:\n' +
    '{chunkContent}\n\n' +
    'YÊU CẦU CÂU HỎI:\n' +
    '- Mức độ khó: {difficulty} (DỄ: nhớ lại đơn giản, TRUNG BÌNH: cần hiểu biết, KHÓ: tư duy phản biện)\n' +
    '- Mức độ phân loại Bloom: {bloomLevel}\n' +
    '  * NHỚ LẠI: ghi nhớ sự kiện và khái niệm cơ bản\n' +
    '  * HIỂU: giải thích khái niệm và ý tưởng\n' +
    '  * ÁP DỤNG: sử dụng thông tin trong những tình huống mới\n' +
    '  * PHÂN TÍCH: chia nhỏ thông tin thành các thành phần\n' +
    '  * ĐÁNH GIÁ: đưa ra phán xét dựa trên tiêu chí\n' +
    '  * TẠO: kết hợp các phần tử để tạo ra cái gì đó mới\n' +
    '- Loại câu hỏi: Trắc nghiệm với 4 tùy chọn\n' +
    '- Đảm bảo phù hợp với mục tiêu bài học và nội dung phần\n' +
    '{customIdea}\n\n' +
    '**VIẾT TẤT CẢ BẰNG TIẾNG VIỆT: CÂU HỎI, CÁC ĐÁP ÁN, VÀ GIẢI THÍCH ĐỀU PHẢI BẰNG TIẾNG VIỆT.**\n\n' +
    'ĐỊNH DẠNG PHẢN HỒI (JSON hợp lệ hoàn toàn, TẤT CẢ BẰNG TIẾNG VIỆT):\n' +
    '{\n' +
    '  "question": "Văn bản câu hỏi rõ ràng, cụ thể (TIẾNG VIỆT)",\n' +
    '  "choices": [\n' +
    '    { "text": "Đáp án đúng (TIẾNG VIỆT)", "isCorrect": true },\n' +
    '    { "text": "Đáp án sai có khả năng 1 (TIẾNG VIỆT)", "isCorrect": false },\n' +
    '    { "text": "Đáp án sai có khả năng 2 (TIẾNG VIỆT)", "isCorrect": false },\n' +
    '    { "text": "Đáp án sai có khả năng 3 (TIẾNG VIỆT)", "isCorrect": false }\n' +
    '  ],\n' +
    '  "explanation": "Giải thích chi tiết về lý do đáp án đúng là đúng và tại sao các đáp án khác là sai (TIẾNG VIỆT)",\n' +
    '  "confidence": 0.95\n' +
    '}\n\n' +
    'Tạo câu hỏi ngay bây giờ (VIẾT TOÀN BỘ BẰNG TIẾNG VIỆT):',

  /**
   * System prompt for batch quiz generation (English)
   */
  batchSystem: () =>
    'You are an expert educational content creator specializing in generating multiple high-quality multiple-choice quiz questions. ' +
    'Your task is to create diverse quiz questions that test various levels of understanding, aligned with Bloom\'s taxonomy. ' +
    '\n\nREQUIREMENTS:\n' +
    '1. Each question must be clear, concise, and test different aspects of the content\n' +
    '2. Each question must provide exactly 4 answer choices (only one correct)\n' +
    '3. The correct answer must be unambiguous and well-supported by the content\n' +
    '4. Incorrect options should be plausible but clearly distinguishable from the correct answer\n' +
    '5. Include detailed explanations for each question\n' +
    '6. Ensure questions cover different difficulty levels and Bloom\'s levels as specified\n' +
    '7. Format output as valid JSON array (no markdown formatting, code fences, or extra text)\n' +
    '\n' +
    'You MUST respond with a strictly valid JSON array only.\n' +
    'Do NOT include markdown, code fences, comments, explanations, or extra text.\n' +
    'The response must be directly parseable JSON.',

  /**
   * System prompt for batch quiz generation (Vietnamese)
   */
  batchSystemVi: () =>
    'Bạn là một chuyên gia tạo nội dung giáo dục, chuyên biệt trong việc tạo nhiều câu hỏi trắc nghiệm chất lượng cao. ' +
    'Nhiệm vụ của bạn là tạo các câu hỏi quiz đa dạng kiểm tra các mức độ hiểu biết khác nhau, phù hợp với phân loại Bloom. ' +
    '\n\n**QUAN TRỌNG: TẤT CẢ NỘI DUNG PHẢI ĐƯỢC VIẾT BẰNG TIẾNG VIỆT. KHÔNG DÙNG TIẾNG ANH.**' +
    '\n\nYÊU CẦU:\n' +
    '1. Mỗi câu hỏi phải rõ ràng, ngắn gọn và kiểm tra các khía cạnh khác nhau của nội dung\n' +
    '2. Mỗi câu hỏi phải cung cấp chính xác 4 lựa chọn trả lời (chỉ có một đáp án đúng)\n' +
    '3. Đáp án đúng phải rõ ràng và được hỗ trợ tốt bởi nội dung\n' +
    '4. Các lựa chọn sai phải có khả năng nhưng phân biệt rõ ràng với đáp án đúng\n' +
    '5. Đưa ra giải thích chi tiết cho mỗi câu hỏi\n' +
    '6. Đảm bảo câu hỏi bao gồm các mức độ khó khác nhau và các mức Bloom như được chỉ định\n' +
    '7. Định dạng kết quả dưới dạng mảng JSON hợp lệ (không có markdown, code fences hoặc văn bản bổ sung)\n' +
    '\n' +
    'BẠN PHẢI trả lời bằng một mảng JSON hoàn toàn hợp lệ.\n' +
    'KHÔNG bao gồm markdown, code fences, nhận xét, giải thích hoặc văn bản bổ sung.\n' +
    'Phản hồi phải có thể phân tích cú pháp JSON trực tiếp.\n' +
    '**LƯU Ý: VIẾT TẤT CẢ BẰNG TIẾNG VIỆT, BẢO GỒM CÁC CÂU HỎI, ĐÁP ÁN, VÀ GIẢI THÍCH.**',

  /**
   * User prompt template for batch quiz generation (English)
   * Substitutes: {lessonSummary}, {chunkSummary}, {chunkContent}, {distributionJson}
   */
  batchUser: () =>
    'Based on the following lesson and chunk context, generate multiple high-quality multiple-choice questions.\n\n' +
    'LESSON OVERVIEW:\n' +
    '{lessonSummary}\n\n' +
    'CHUNK TOPIC:\n' +
    '{chunkSummary}\n\n' +
    'CHUNK CONTENT:\n' +
    '{chunkContent}\n\n' +
    'QUESTION DISTRIBUTION (generate exactly as specified):\n' +
    '{distributionJson}\n\n' +
    'INSTRUCTIONS:\n' +
    '- Generate questions matching the exact distribution above\n' +
    '- Ensure diversity: cover different aspects of the content\n' +
    '- Align each question with the specified difficulty and Bloom\'s level\n' +
    '- Each question must relate to the chunk content and lesson objectives\n\n' +
    'RESPONSE FORMAT (Strictly valid JSON array):\n' +
    '[\n' +
    '  {\n' +
    '    "question": "The clear, specific question text",\n' +
    '    "choices": [\n' +
    '      { "text": "Correct answer", "isCorrect": true },\n' +
    '      { "text": "Plausible wrong answer 1", "isCorrect": false },\n' +
    '      { "text": "Plausible wrong answer 2", "isCorrect": false },\n' +
    '      { "text": "Plausible wrong answer 3", "isCorrect": false }\n' +
    '    ],\n' +
    '    "explanation": "Detailed explanation",\n' +
    '    "confidence": 0.95\n' +
    '  },\n' +
    '  // ... more questions following the distribution\n' +
    ']\n\n' +
    'Generate the questions now:',

  /**
   * User prompt template for batch quiz generation (Vietnamese)
   * Substitutes: {lessonSummary}, {chunkSummary}, {chunkContent}, {distributionJson}
   */
  batchUserVi: () =>
    '**VIẾT TẤT CẢ NỘI DUNG BẰNG TIẾNG VIỆT. KHÔNG DÙNG TIẾNG ANH BẠT CỬ NÀO.**\n\n' +
    'Dựa trên ngữ cảnh bài học và phần sau đây, hãy tạo nhiều câu hỏi trắc nghiệm chất lượng cao HOÀN TOÀN BẰNG TIẾNG VIỆT.\n\n' +
    'TỔNG QUAN BÀI HỌC:\n' +
    '{lessonSummary}\n\n' +
    'CHỦ ĐỀ PHẦN:\n' +
    '{chunkSummary}\n\n' +
    'NỘI DUNG PHẦN:\n' +
    '{chunkContent}\n\n' +
    'PHÂN BỐ CÂU HỎI (tạo chính xác như được chỉ định):\n' +
    '{distributionJson}\n\n' +
    'HƯỚNG DẪN:\n' +
    '- Tạo các câu hỏi khớp với phân bố chính xác ở trên\n' +
    '- Đảm bảo tính đa dạng: bao gồm các khía cạnh khác nhau của nội dung\n' +
    '- Căn chỉnh mỗi câu hỏi với mức độ khó và mức Bloom được chỉ định\n' +
    '- Mỗi câu hỏi phải liên quan đến nội dung phần và mục tiêu bài học\n' +
    '{customIdea}\n\n' +
    '**VIẾT TẤT CẢ BẰNG TIẾNG VIỆT: CÁC CÂU HỎI, ĐÁP ÁN, VÀ GIẢI THÍCH ĐỀU PHẢI BẰNG TIẾNG VIỆT.**\n\n' +
    'ĐỊNH DẠNG PHẢN HỒI (Mảng JSON hợp lệ hoàn toàn, TẤT CẢ BẰNG TIẾNG VIỆT):\n' +
    '[\n' +
    '  {\n' +
    '    "question": "Văn bản câu hỏi rõ ràng, cụ thể (TIẾNG VIỆT)",\n' +
    '    "choices": [\n' +
    '      { "text": "Đáp án đúng (TIẾNG VIỆT)", "isCorrect": true },\n' +
    '      { "text": "Đáp án sai có khả năng 1 (TIẾNG VIỆT)", "isCorrect": false },\n' +
    '      { "text": "Đáp án sai có khả năng 2 (TIẾNG VIỆT)", "isCorrect": false },\n' +
    '      { "text": "Đáp án sai có khả năng 3 (TIẾNG VIỆT)", "isCorrect": false }\n' +
    '    ],\n' +
    '    "explanation": "Giải thích chi tiết (TIẾNG VIỆT)",\n' +
    '    "confidence": 0.95\n' +
    '  },\n' +
    '  // ... các câu hỏi tiếp theo theo phân bố\n' +
    ']\n\n' +
    'Tạo các câu hỏi ngay bây giờ (VIẾT TOÀN BỘ BẰNG TIẾNG VIỆT):',

  /**
   * Helper function to build single quiz prompt (always Vietnamese)
   */
  buildSingleQuizPrompt: (
    chunkContent: string,
    chunkSummary: string,
    lessonSummary: string,
    options: { difficulty: string; bloomLevel: string; questionType: string; userPrompt?: string },
    language: QuizLanguage = 'vi'
  ) => {
    const systemPrompt = QuizPrompts.singleSystemVi();
    const userPromptTemplate = QuizPrompts.singleUserVi();

    const userPrompt = userPromptTemplate
      .replace('{difficulty}', options.difficulty || 'MEDIUM')
      .replace('{bloomLevel}', options.bloomLevel || 'UNDERSTAND')
      .replace('{lessonSummary}', lessonSummary || 'Không có tóm tắt bài học')
      .replace('{chunkSummary}', chunkSummary || 'Không có tóm tắt phần')
      .replace('{chunkContent}', chunkContent || 'Không có nội dung phần')
      .replace('{customIdea}', options.userPrompt ? `- Ý TƯỞNG CỦA NGƯỜI DÙNG CẦN LỒNG GHÉP: ${options.userPrompt}` : '');

    return {
      systemPrompt,
      userPrompt,
    };
  },

  /**
   * Helper function to build batch quiz prompt (always Vietnamese)
   */
  buildBatchQuizPrompt: (
    chunkContent: string,
    chunkSummary: string,
    lessonSummary: string,
    options: { count: number; distribution: Array<{ difficulty?: string; bloomLevel?: string; count?: number }>; userPrompt?: string },
    language: QuizLanguage = 'vi'
  ) => {
    const systemPrompt = QuizPrompts.batchSystemVi();
    const userPromptTemplate = QuizPrompts.batchUserVi();

    const distributionJson = options.distribution
      .map(
        d =>
          `${d.count || 1} câu hỏi ở mức độ khó ${d.difficulty || 'MEDIUM'}, mức độ Bloom ${d.bloomLevel || 'UNDERSTAND'}`
      )
      .join('\n');

    const userPrompt = userPromptTemplate
      .replace('{lessonSummary}', lessonSummary || 'Không có tóm tắt bài học')
      .replace('{chunkSummary}', chunkSummary || 'Không có tóm tắt phần')
      .replace('{chunkContent}', chunkContent || 'Không có nội dung phần')
      .replace('{distributionJson}', distributionJson)
      .replace('{customIdea}', options.userPrompt ? `- Ý TƯỞNG CỦA NGƯỜI DÙNG CẦN LỒNG GHÉP: ${options.userPrompt}` : '');

    return {
      systemPrompt,
      userPrompt,
    };
  },
} as const

export interface ParsedQuizChoice {
  text: string
  isCorrect: boolean
  feedback?: string
}

export interface ParsedQuiz {
  question: string
  choices: ParsedQuizChoice[]
  explanation: string
  type?: string
  difficulty?: string
  bloomLevel?: string
  confidence?: number
}
