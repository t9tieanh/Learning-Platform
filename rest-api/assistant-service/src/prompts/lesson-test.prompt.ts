import type { QuizLanguage } from '~/prompts/quiz.prompt';

/**
 * Prompts for lesson-test (bài kiểm tra) batch quiz generation.
 * Review/practice (ôn tập) prompts live in `quiz.prompt.ts`.
 */
export const LessonTestPrompts = {
  mergedChunkTopicVi: () =>
    'Đây là ngữ cảnh gộp từ một nhóm phần nội dung (bài kiểm tra). ' +
    'Mọi câu hỏi phải dựa trên toàn bộ MERGED CONTEXT — có thể liên quan nhiều phần được đánh dấu Chunk 1, Chunk 2, …',

  mergedChunkTopicEn: () =>
    'This is merged context from a lesson-test chunk group. ' +
    'Every question must be grounded in the full MERGED CONTEXT — possibly spanning multiple sections labeled Chunk 1, Chunk 2, …',

  batchSystemVi: () =>
    'Bạn là một chuyên gia tạo nội dung giáo dục, chuyên biệt trong việc tạo nhiều câu hỏi trắc nghiệm cho BÀI KIỂM TRA cuối bài. ' +
    'Nhiệm vụ của bạn là tạo các câu hỏi quiz đa dạng kiểm tra các mức độ hiểu biết khác nhau, phù hợp với phân loại Bloom. ' +
    '\n\n**QUAN TRỌNG: TẤT CẢ NỘI DUNG PHẢI ĐƯỢC VIẾT BẰNG TIẾNG VIỆT. KHÔNG DÙNG TIẾNG ANH.**' +
    '\n\nYÊU CẦU:\n' +
    '1. Mỗi câu hỏi phải rõ ràng, ngắn gọn và kiểm tra các khía cạnh khác nhau của nội dung. **ƯU TIÊN tạo các câu hỏi mang tính TỔNG HỢP kiến thức từ NHIỀU phân đoạn (chunk) khác nhau trong ngữ cảnh để kiểm tra mức độ hiểu sâu.**\n' +
    '2. Mỗi câu hỏi phải cung cấp chính xác 4 lựa chọn trả lời (chỉ có một đáp án đúng)\n' +
    '3. Đáp án đúng phải rõ ràng và được hỗ trợ tốt bởi nội dung\n' +
    '4. Các lựa chọn sai phải có khả năng nhưng phân biệt rõ ràng với đáp án đúng\n' +
    '5. Đưa ra giải thích CỰC KỲ CHI TIẾT cho mỗi câu hỏi. Trong phần "explanation", bạn BẮT BUỘC phải trích dẫn TẤT CẢ các phân đoạn liên quan bằng marker @{{chunkId}}@ — ký tự @ và cặp ngoặc nhọn kép {{ }} đều BẮT BUỘC. Chỉ dùng UUID có trong danh sách AVAILABLE CHUNK IDs (không tự bịa ID). SAI: @chunk-id@ (thiếu {{}}). ĐÚNG: @{{chunk-id}}@ với chunk-id lấy đúng từ danh sách. Nếu câu hỏi tổng hợp từ nhiều chunk, phải có đủ marker cho từng chunk.\n' +
    '6. Đảm bảo câu hỏi bao gồm các mức độ khó khác nhau và các mức Bloom như được chỉ định\n' +
    '7. Với mỗi câu hỏi, hãy xác định chunk nguồn chính và trả về UUID của nó trong trường "groundedChunkId".\n' +
    '8. Định dạng kết quả dưới dạng mảng JSON hợp lệ (không có markdown, code fences hoặc văn bản bổ sung)\n' +
    '\n' +
    'BẠN PHẢI trả lời bằng một mảng JSON hoàn toàn hợp lệ.\n' +
    'KHÔNG bao gồm markdown, code fences, nhận xét, giải thích hoặc văn bản bổ sung.\n' +
    'Phản hồi phải có thể phân tích cú pháp JSON trực tiếp.\n' +
    '**LƯU Ý: VIẾT TẤT CẢ BẰNG TIẾNG VIỆT, BẢO GỒM CÁC CÂU HỎI, ĐÁP ÁN, VÀ GIẢI THÍCH.**',

  batchUserVi: () =>
    '**VIẾT TẤT CẢ NỘI DUNG BẰNG TIẾNG VIỆT. KHÔNG DÙNG TIẾNG ANH BẠT CỬ NÀO.**\n\n' +
    'Dựa trên ngữ cảnh bài kiểm tra (merged context) sau đây, hãy tạo nhiều câu hỏi trắc nghiệm chất lượng cao HOÀN TOÀN BẰNG TIẾNG VIỆT.\n\n' +
    'TỔNG QUAN BÀI HỌC:\n' +
    '{lessonSummary}\n\n' +
    'CHỦ ĐỀ NHÓM PHẦN:\n' +
    '{chunkSummary}\n\n' +
    'MERGED CONTEXT:\n' +
    '{chunkContent}\n\n' +
    '{chunkIdsSection}' +
    'PHÂN BỐ CÂU HỎI (tạo chính xác như được chỉ định):\n' +
    '{distributionJson}\n\n' +
    'HƯỚNG DẪN:\n' +
    '- Tạo các câu hỏi khớp với phân bố chính xác ở trên\n' +
    '- Đảm bảo tính đa dạng: bao gồm các khía cạnh khác nhau của nội dung\n' +
    '- Căn chỉnh mỗi câu hỏi với mức độ khó và mức Bloom được chỉ định\n' +
    '- Mỗi câu hỏi phải liên quan đến merged context và mục tiêu bài học\n' +
    '{customIdea}\n\n' +
    '**VIẾT TẤT CẢ BẰNG TIẾNG VIỆT: CÁC CÂU HỎI, ĐÁP ÁN, VÀ GIẢI THÍCH ĐỀU PHẢI BẰNG TIẾNG VIỆT.**\n\n' +
    'ĐỊNH DẠNG PHẢN HỒI (Mảng JSON hợp lệ hoàn toàn, TẤT CẢ BẰNG TIẾNG VIỆT):\n' +
    '{responseFormatExample}\n\n' +
    'Tạo các câu hỏi ngay bây giờ (VIẾT TOÀN BỘ BẰNG TIẾNG VIỆT):',

  /** JSON array example — citations use real chunk IDs from the current request. */
  buildResponseFormatExample: (chunkIds: string[]): string => {
    const citations =
      chunkIds.length >= 2
        ? `@{{${chunkIds[0]}}}@ và @{{${chunkIds[1]}}}@`
        : chunkIds.length === 1
          ? `@{{${chunkIds[0]}}}@`
          : '@{{CHUNK_ID_TỪ_DANH_SÁCH}}@';

    const groundedChunkId =
      chunkIds.length > 0 ? chunkIds[0] : 'UUID_CHUNK_NGUỒN_CHÍNH_TỪ_DANH_SÁCH';

    return (
      '[\n' +
      '  {\n' +
      '    "question": "Văn bản câu hỏi rõ ràng, cụ thể (TIẾNG VIỆT)",\n' +
      '    "choices": [\n' +
      '      { "text": "Đáp án đúng (TIẾNG VIỆT)", "isCorrect": true },\n' +
      '      { "text": "Đáp án sai có khả năng 1 (TIẾNG VIỆT)", "isCorrect": false },\n' +
      '      { "text": "Đáp án sai có khả năng 2 (TIẾNG VIỆT)", "isCorrect": false },\n' +
      '      { "text": "Đáp án sai có khả năng 3 (TIẾNG VIỆT)", "isCorrect": false }\n' +
      '    ],\n' +
      `    "explanation": "Giải thích cực kỳ chi tiết, tổng hợp kiến thức từ ${citations}. Giải thích rõ mối liên hệ logic giữa các phần này.",\n` +
      `    "groundedChunkId": "${groundedChunkId}",\n` +
      '    "confidence": 0.95\n' +
      '  }\n' +
      '  // ... các câu hỏi tiếp theo theo phân bố\n' +
      ']'
    );
  },

  buildCitationFormatHint: (chunkIds: string[], language: QuizLanguage = 'vi'): string => {
    if (chunkIds.length === 0) {
      return language === 'vi'
        ? 'ĐỊNH DẠNG TRÍCH DẪN BẮT BUỘC: @{{CHUNK_ID}}@ — CHUNK_ID phải là UUID từ merged context (dòng chunk_id: ...).\n\n'
        : 'REQUIRED CITATION FORMAT: @{{CHUNK_ID}}@ — CHUNK_ID must be a UUID from merged context (chunk_id: ... lines).\n\n';
    }

    const exampleId = chunkIds[0];
    if (language === 'vi') {
      return (
        'AVAILABLE CHUNK IDs (chỉ dùng các ID này khi trích dẫn trong explanation):\n' +
        chunkIds.map((id) => `- ${id}`).join('\n') +
        '\n\n' +
        'ĐỊNH DẠNG TRÍCH DẪN BẮT BUỘC: @{{CHUNK_ID}}@\n' +
        `- Cú pháp đúng: @{{ ... }}@ bọc quanh một UUID trong danh sách trên\n` +
        `- Cú pháp sai: @UUID@ (thiếu cặp ngoặc nhọn kép {{ }})\n` +
        'Mỗi chunk được trích dẫn phải dùng đúng UUID từ danh sách trên.\n\n'
      );
    }

    return (
      'AVAILABLE CHUNK IDs (use only these IDs in explanation citations):\n' +
      chunkIds.map((id) => `- ${id}`).join('\n') +
      '\n\n' +
      'REQUIRED CITATION FORMAT: @{{CHUNK_ID}}@\n' +
      `- Correct syntax: @{{ ... }}@ wrapping a UUID from the list above\n` +
      `- Wrong syntax: @UUID@ (missing double curly braces {{ }})\n` +
      'Every cited chunk must use an exact UUID from the list above.\n\n'
    );
  },

  buildBatchQuizPrompt: (
    mergedContext: string,
    chunkSummary: string,
    lessonSummary: string,
    options: {
      distribution: Array<{ difficulty?: string; bloomLevel?: string; count?: number }>;
      userPrompt?: string;
      chunkIds: string[];
    },
    language: QuizLanguage = 'vi'
  ) => {
    const systemPrompt = LessonTestPrompts.batchSystemVi();
    const userPromptTemplate = LessonTestPrompts.batchUserVi();

    const distributionJson = options.distribution
      .map(
        (d) =>
          `${d.count || 1} câu hỏi ở mức độ khó ${d.difficulty || 'MEDIUM'}, mức độ Bloom ${d.bloomLevel || 'UNDERSTAND'}`
      )
      .join('\n');

    const chunkIdsSection = LessonTestPrompts.buildCitationFormatHint(options.chunkIds, language);
    const responseFormatExample = LessonTestPrompts.buildResponseFormatExample(options.chunkIds);

    const userPrompt = userPromptTemplate
      .replace('{lessonSummary}', lessonSummary || 'Không có tóm tắt bài học')
      .replace('{chunkSummary}', chunkSummary || 'Không có tóm tắt nhóm phần')
      .replace('{chunkContent}', mergedContext || 'Không có merged context')
      .replace('{chunkIdsSection}', chunkIdsSection)
      .replace('{distributionJson}', distributionJson)
      .replace('{responseFormatExample}', responseFormatExample)
      .replace(
        '{customIdea}',
        options.userPrompt ? `- Ý TƯỞNG CỦA NGƯỜI DÙNG CẦN LỒNG GHÉP: ${options.userPrompt}` : ''
      );

    return { systemPrompt, userPrompt };
  },
} as const;
