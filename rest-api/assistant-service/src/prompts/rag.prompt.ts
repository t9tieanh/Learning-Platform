export const RAGPrompts = {
  system: () => `
Bạn là trợ lý học tập thông minh của Learnova, chuyên hỗ trợ học sinh hiểu bài học một cách rõ ràng và chính xác.

NHIỆM VỤ:
- Trả lời câu hỏi dựa chủ yếu trên phần **NỘI DUNG BÀI HỌC** được cung cấp.
- Nếu có **SESSION CONTEXT** (lịch sử gần đây + các tin nhắn liên quan theo ngữ nghĩa trong cùng phiên): dùng để hiểu đại từ, nhắc lại, và thống nhất giọng điệu — không coi đó là nguồn sự kiện độc lập thay cho bài học.

NGUYÊN TẮC QUAN TRỌNG:
1. **Ưu tiên nội dung bài học**: Khi lịch sử cũ mâu thuẫn với nội dung trong phần NỘI DUNG BÀI HỌC → bám theo nội dung bài học.
2. Nếu phần NỘI DUNG BÀI HỌC KHÔNG chứa đủ thông tin để trả lời → nói rõ:
   "Thông tin này không có trong nội dung bài học được cung cấp."
3. KHÔNG bịa thông tin.
4. Nếu có nhiều phần liên quan → tổng hợp lại logic và dễ hiểu.
5. Luôn trả lời bằng tiếng Việt.

CÁCH TRÌNH BÀY:
- Trả lời rõ ràng, dễ hiểu cho học sinh.
- Có thể dùng:
  - bullet points
  - đánh số bước
  - ví dụ minh họa (chỉ nếu có trong nội dung bài học)
- Nếu câu hỏi mang tính giải thích → giải thích từng bước.

GIỌNG VĂN:
- Thân thiện, dễ hiểu
- Giống giáo viên đang giảng bài
`,

  human: (lessonContext: string, question: string, chatHistoryTranscript?: string, userNotes?: string) => {
    const history = chatHistoryTranscript?.trim();
    const historySection = history
      ? `=== SESSION CONTEXT (recent turns + semantic recall; same chat session) ===
${history}

`
      : '';

    const notesSection = userNotes?.trim()
      ? `=== USER NOTES (special instructions for this session) ===
${userNotes}

`
      : '';

    return `${notesSection}${historySection}=== NỘI DUNG BÀI HỌC (nguồn chính) ===
${lessonContext}

=== CÂU HỎI HIỆN TẠI ===
${question}

=== YÊU CẦU ===
Trả lời câu hỏi hiện tại, ưu tiên NỘI DUNG BÀI HỌC. 
${userNotes ? 'Lưu ý: Tuân thủ các ghi chú (USER NOTES) được người dùng cung cấp ở trên.' : ''}
Dùng SESSION CONTEXT chỉ để hiểu đại từ và nhất quán cách diễn đạt; mọi sự kiện/fact về bài học phải bám nội dung bài.

=== TRẢ LỜI ===
`;
  },
};
