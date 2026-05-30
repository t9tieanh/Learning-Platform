import React, { useState } from 'react'
import { ChevronDown, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

const HELP_ID = 'lesson-exam-blueprint-help'

/**
 * Intro callout and expandable how-to (CLO matrix example, step-by-step) for content-sliced exams.
 * Open/close state is local; parent `LessonExamBlueprintSection` does not own it.
 */
const LessonExamBlueprintHelpPanel: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className='px-0.5 flex items-start gap-2 rounded-xl border border-amber-100/60 bg-amber-50/15 p-2.5 md:p-3'>
      <span className='mt-0.5 p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100/80 shrink-0'>
        <Lightbulb className='w-3.5 h-3.5' strokeWidth={2.25} />
      </span>
      <div className='min-w-0 flex-1'>
        {!open ? (
          <p className='text-[11px] md:text-[12px] text-gray-600 font-medium leading-snug'>
            Ở đây bạn tạo câu hỏi theo từng{' '}
            <strong className='font-semibold text-gray-800'>nhóm nội dung</strong>: mỗi nhóm = chọn phân đoạn
            video + phân bổ số câu từng nhóm theo tổng bạn chọn (+ tuỳ chọn gợi ý cách ra đề), rồi
            sinh câu. Bấm{' '}
            <span className='font-semibold text-blue-600'>Hướng dẫn cho người mới</span> bên dưới nếu bạn
            cần đi từng bước chi tiết hơn.
          </p>
        ) : (
          <div
            className='text-[11px] md:text-[12px] text-gray-600 font-medium leading-snug space-y-2.5'
            id={HELP_ID}
          >
            <p className='text-[12px] md:text-[13px] font-semibold text-gray-800'>
              Bài kiểm tra theo từng mảng nội dung — bắt đầu từ đâu?
            </p>
            <p>
              Phần này giúp bạn tạo nhanh câu hỏi (trắc nghiệm theo từng cấp Bloom, v.v.) dựa trên{' '}
              <strong className='font-semibold text-gray-800'>các phân đoạn</strong> mà hệ thống đã tách từ video. Bạn
              không cần tự nghĩ từng câu: AI dựa trên tóm tắt/ nội dung từng phân đoạn để ra đề.
            </p>
            <p>
              Một <strong className='font-semibold text-gray-800'>nhóm nội dung</strong> tương ứng{' '}
              <strong className='font-semibold text-gray-800'>một lần bấm cấu hình</strong>: bạn mô tả rõ cần bao nhiêu
              câu, từ phân đoạn nào, (tuỳ chọn) cách bạn muốn ra đề. Mỗi nhóm là một dòng cấu hình; có
              thể có nhiều nhóm (ví dụ nhóm 1: phần đầu bài, nhóm 2: phần thực hành).
            </p>
            <p className='text-[12px] md:text-[13px] font-semibold text-gray-800'>
              Ví dụ: ánh xạ chuẩn đầu ra ↔ câu hỏi (ma trận)
            </p>
            <p>
              Tính năng này được thiết kế theo <strong className='font-semibold text-gray-800'>cùng tinh thần quy
                chuẩn</strong> như khi bạn lập <strong>ma trận: chuẩn đầu ra môn học (CLO) – câu hỏi đánh
                  giá</strong>: mỗi mục tiêu/ mảng nội dung tương ứng một nhóm câu hỏi phục vụ kiểm tra. Bảng
              minh hoạ bên dưới (trích từ quy ước thường dùng trong soạn bài) giúp bạn hình dung vì sao
              chúng tôi cho phép cấu hình từng <strong className='font-semibold text-gray-800'>nhóm nội dung</strong> và gắn gợi ý cách ra đề.
            </p>
            <div className='overflow-x-auto rounded-lg border border-blue-200/80 bg-white/60 shadow-sm'>
              <table className='w-full min-w-[280px] text-left text-[11px] md:text-[12px] border-collapse'>
                <thead>
                  <tr className='border-b border-blue-200/90 bg-blue-50/50'>
                    <th
                      scope='col'
                      className='p-2 font-semibold text-blue-600 align-top w-1/2 sm:w-[55%] border-r border-blue-200/80'
                    >
                      Chuẩn đầu ra của học phần
                    </th>
                    <th scope='col' className='p-2 font-semibold text-blue-600 align-top'>
                      Câu hỏi
                    </th>
                  </tr>
                </thead>
                <tbody className='text-gray-700'>
                  <tr className='border-b border-blue-100/90'>
                    <td className='p-2 align-top border-r border-blue-100/80'>
                      <span className='font-semibold text-gray-800'>[G1.1]</span> Giải thích được các nội
                      dung lập trình cơ bản như: mệnh đề if, vòng lặp, mảng.
                    </td>
                    <td className='p-2 align-top text-gray-800'>Câu 1, câu 2, câu 3</td>
                  </tr>
                  <tr>
                    <td className='p-2 align-top border-r border-blue-100/80'>
                      <span className='font-semibold text-gray-800'>[G2.1]</span> Viết được các chương trình
                      giải quyết những vấn đề kỹ thuật cơ bản sử dụng ngôn ngữ lập trình Python.
                    </td>
                    <td className='p-2 align-top text-gray-800'>Câu 3, câu 4, câu 5</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className='text-[11px] md:text-[12px] text-gray-500 font-medium italic border-l-2 border-blue-200 pl-2 leading-snug'>
              Trong giao diện tạo bài, bạn cấu hình <strong className='font-semibold text-gray-700'>nhóm nội dung tương ứng từng phân đoạn/ mảng
                kiến thức</strong> và tổng câu — tương tự cách bạn quy ước ở cột trái bảng trên, rồi ánh
              xạ sang các câu ở cột phải sau khi sinh xong từ nội dung từng phần.
            </p>
            <p className='text-[12px] md:text-[13px] font-semibold text-gray-800'>Các bước theo từng nhóm nội dung</p>
            <ol className='list-decimal pl-3.5 space-y-1 marker:font-semibold marker:text-gray-800'>
              <li>
                <strong className='font-semibold text-gray-800'>Tổng câu toàn bài</strong> — Bạn chọn tổng cần tạo
                (mặc định bằng số phân đoạn). Tổng số câu ở tất cả nhóm bên dưới phải khớp; nếu bạn
                chỉnh từng nhóm mà tổng lệch, bấm &quot;Đồng bộ tổng theo nhóm&quot; cạnh tổng các nhóm
                để cập nhật tổng câu cần tạo theo tổng thực tế ở các nhóm.
              </li>
              <li>
                <strong className='font-semibold text-gray-800'>Nhóm phân đoạn</strong> — Gắn ít nhất một phân đoạn. Có
                thể gắn nhiều: khi đó,{' '}
                <strong className='font-semibold text-gray-800'>số câu nhóm</strong> sẽ được hệ thống{' '}
                <strong className='font-semibold text-gray-800'>chia tương ứng</strong> (ưu tiên công bằng) cho từng phân đoạn trong cùng nhóm.
                Ví dụ: 2 phân đoạn, 5 câu → có thể 3+2, v.v. theo quy tắc nội bộ, không cần bạn tự tính
                từng câu.
              </li>
              <li>
                <strong className='font-semibold text-gray-800'>Số câu từng nhóm</strong> — Mỗi nhóm có 1–50 câu; tổng
                tất cả nhóm bằng tổng câu toàn bài. Một phân đoạn: cả khối câu thuộc phân đoạn đó; nhiều
                phân đoạn trong cùng nhóm: tổng câu nhóm được chia tự động xuống từng phân đoạn.
              </li>
              <li>
                <strong className='font-semibold text-gray-800'>Cách ra đề (gợi ý cho AI)</strong> — Tùy chọn nhưng
                nên dùng nếu bạn muốn bài theo sát ý: ví dụ ưu tiên trắc nghiệm, độ dài, gắn mục tiêu,
                ngôn từ kỹ thuật, v.v. Trống cũng được — AI vẫn dùng tóm tắt phân đoạn mặc định.
              </li>
              <li>
                <strong className='font-semibold text-gray-800'>Xem tóm tắt</strong> — Bên cạnh form chọn phân đoạn có
                ô xem tóm tắt từng phân đoạn đã chọn (tiết kiệm chỗ, chọn từng cái khi cần).
              </li>
              <li>
                Các <strong className='font-semibold text-gray-800'>khu vực thu gọn (nhóm 1, nhóm 2, …)</strong> bên
                dưới: bạn có thể đóng từng khối để tập trung, không lẫn khi nhiều nhóm. Khi thu, vẫn thấy
                tên phân đoạn và số câu tóm tắt.
              </li>
            </ol>
            <p>
              Bấm <strong className='font-semibold text-gray-800'>Sinh câu hỏi theo…</strong> ở cuối: hệ thống chạy
              từng nhóm; nếu tài khoản cần quyền (VIP) bạn sẽ được hướng dẫn. Sau khi xong, câu sẽ gắn
              theo từng phân đoạn — bạn mở phân đoạn ở phía trên (giáo trình) để xem/ chỉnh câu hỏi.
            </p>
          </div>
        )}
        <button
          type='button'
          onClick={() => setOpen((o) => !o)}
          className='mt-2 inline-flex items-center gap-1.5 text-[11px] md:text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors'
          aria-expanded={open}
          aria-controls={open ? HELP_ID : undefined}
        >
          {open ? 'Thu gọn' : 'Hướng dẫn cho người mới (chi tiết)'}
          <ChevronDown
            className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', open && 'rotate-180')}
            strokeWidth={2.25}
            aria-hidden
          />
        </button>
      </div>
    </div>
  )
}

export default LessonExamBlueprintHelpPanel
