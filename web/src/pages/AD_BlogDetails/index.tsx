import BlogDetails from '../BlogDetails'

const AD_BlogDetails = () => {
  return (
    <div className='space-y-6'>
      <div className='rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-sky-50/60 p-6 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.28)]'>
        <p className='text-xs font-semibold uppercase tracking-[0.24em] text-sky-600'>Blog management</p>
        <h1 className='mt-2 text-3xl font-semibold tracking-tight text-slate-950'>Chi tiết bài viết</h1>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500'>
          Theo dõi nội dung, thông tin tác giả và trạng thái bài viết trong một không gian quản trị rõ ràng hơn.
        </p>
      </div>

      <div className='rounded-[32px] border border-slate-200/80 bg-white/95 p-1 shadow-[0_22px_55px_-34px_rgba(15,23,42,0.26)]'>
        <div className='rounded-[28px] bg-white p-1'>
          <BlogDetails />
        </div>
      </div>
    </div>
  )
}

export default AD_BlogDetails
