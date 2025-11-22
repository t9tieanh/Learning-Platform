import { ChromaClient } from 'chromadb'
import { GoogleGenerativeAI } from '@google/generative-ai'
import supabase from '~/config/supabase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Embedding model (không đổi, vẫn dùng text-embedding-004 vì nó ổn định)
async function generateEmbedding(text: string | string[]) {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })

  const result = await model.embedContent(text)
  return result.embedding.values
}

const chroma = new ChromaClient({
  path: 'http://localhost:8000'
})

async function searchSimilarCourses(query: string) {
  const embedding = await generateEmbedding(query)

  try {
    const { data, error } = await supabase.rpc('match_course_embeddings', {
      query_embedding: embedding,
      match_count: 5,
      similarity_threshold: 0.3
    })

    if (error) throw error
    if (data && data.length) {
      // If RPC does not include link, fetch details
      const ids = data.map((r: any) => r.id).filter((v: any) => v != null)
      const linkMap: Record<number, string> = {}
      if (ids.length) {
        const { data: detail } = await supabase.from('course_embeddings').select('id, link').in('id', ids)
        ;(detail || []).forEach((d: any) => {
          linkMap[d.id] = d.link
        })
      }
      return data.map((row: any) => {
        const tags = Array.isArray(row.tags) ? row.tags.join(', ') : String(row.tags ?? '')
        const link = row.link || linkMap[row.id] || ''
        return `${row.name} - ${tags}\n${row.description}${link ? `\nLink: ${link}` : ''}`
      })
    }
  } catch (e: any) {
    console.warn('Supabase RPC match_course_embeddings failed or missing. Falling back.', e?.message || e)
  }

  try {
    const { data, error } = await supabase
      .from('course_embeddings')
      .select('name, description, tags, link')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5)

    if (!error && data && data.length) {
      return data.map((row: any) => {
        const tags = Array.isArray(row.tags) ? row.tags.join(', ') : String(row.tags ?? '')
        return `${row.name} - ${tags}\n${row.description}${row.link ? `\nLink: ${row.link}` : ''}`
      })
    }
  } catch (e) {
    // ignore and try chroma
  }

  try {
    const collection = await chroma.getOrCreateCollection({ name: 'courses' })
    const results = await collection.query({ queryEmbeddings: [embedding], nResults: 5 })
    const docs = results.documents[0] || []
    return docs.map((doc: string | null) => doc || '')
  } catch (e: any) {
    console.warn('Chroma query failed:', e?.message || e)
    return []
  }
}

async function generateReply(userMessage: string) {
  const relatedCourses = await searchSimilarCourses(userMessage)

  const contextText =
    relatedCourses.length > 0
      ? relatedCourses.map((c: string, i: number) => `(${i + 1}) ${c}`).join('\n\n')
      : 'Không có dữ liệu khóa học liên quan.'

  // const prompt = `
  //     Bạn là Nova - AI tư vấn khóa học cho nền tảng học trực tuyến.
  //     Chỉ sử dụng thông tin sau để trả lời, không tự bịa thêm:

  //     ${contextText}

  //     Người dùng hỏi: "${userMessage}"

  //     Hướng dẫn trả lời:
  //     1. Nếu câu hỏi liên quan tới thông tin khóa học (giá, giảng viên, lịch học, nội dung chi tiết...), từ chối khéo:
  //     "Xin lỗi, Nova không thể cung cấp thông tin này. Bạn có thể hỏi về nội dung hoặc chủ đề của khóa học nhé!" ✨
  //     2. Nếu câu hỏi phù hợp với thông tin có trong context, trả lời ngắn gọn, thân thiện, bằng tiếng Việt.
  //     3. Mỗi câu trả lời từ Nova đều bắt đầu bằng một icon emoji phù hợp, ví dụ: 📘, 💡, 🎯 để tạo cảm giác thân thiện.

  //     Nếu không có thông tin phù hợp trong context, trả lời lịch sự:
  //     "Tôi không tìm thấy khóa học phù hợp với yêu cầu của bạn. Bạn có thể mô tả chi tiết hơn không ạ?" 😊
  // `;

  const prompt = `
        Bạn là Nova - AI tư vấn khóa học cho nền tảng học trực tuyến.

        Chỉ sử dụng thông tin sau để trả lời, không tự bịa thêm:
        ${contextText}

        Người dùng hỏi: "${userMessage}"

        Hướng dẫn trả lời:

        1: Luật nội dung
        - Nếu câu hỏi liên quan tới thông tin cụ thể như: giá khóa học, giảng viên, lịch học, ưu đãi, chi tiết chương trình...
        → Từ chối khéo:
        "😅 Xin lỗi, Nova không thể cung cấp thông tin này. Nhưng bạn có thể hỏi về nội dung, mức độ, chủ đề hay kỹ năng mà khóa học mang lại nhé!" ✨

        2: Sử dụng context
        - Nếu thông tin trong context phù hợp câu hỏi:
        Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng và thân thiện.
        - Mỗi câu trả lời phải bắt đầu bằng một emoji phù hợp như: 📘, 💡, 🎯, 😎

        3: Quy tắc trình bày
        - Nếu có kết quả khóa học liên quan:
        + Viết theo thứ tự dạng danh sách:
            1. Thông tin Khóa học 1,
            2. Thông tin khóa học tiếp theo...
        - Nếu tìm được hơn 5 kết quả:
        + Chỉ hiển thị 5 khóa đầu tiên
        + Thêm câu:
            "😄 Và còn nhiều khóa học nữa phù hợp với bạn, bạn có thể tìm hiểu thêm nhé!"

        4: Nếu không tìm thấy thông tin phù hợp:
        Trả lời lịch sự:
        "😅 Tôi chưa tìm thấy khóa học phù hợp với yêu cầu của bạn. Bạn có thể mô tả chi tiết hơn không ạ?"

        5: Kết thúc câu trả lời
        - Luôn kết thúc bằng một câu thân thiện như:
        "✨ Bạn cần Nova hỗ trợ gì thêm không ạ?"
        "🤗 Nếu bạn muốn, Nova có thể gợi ý thêm khóa học phù hợp hơn!"
        "❤️ Nova luôn sẵn sàng giúp bạn!"

        Lưu ý quan trọng:
        - Không dùng dạng in đậm (** **) trong câu trả lời thay vào đó dùng dấu : để phân tách ý nếu cần.
        - Viết tự nhiên, đơn giản, không quá máy móc.
    `

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash'
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}

async function testChat() {
  const userMessage = 'Tôi muốn học backend Java'

  try {
    const reply = await generateReply(userMessage)
    console.log('User:', userMessage)
    console.log('Nova:', reply)
  } catch (error: any) {
    console.error('Lỗi khi test chat:', error.message)
  }
}

const AiChatService = {
  generateReply,
  generateEmbedding,
  searchSimilarCourses,
  testChat
}

export default AiChatService
