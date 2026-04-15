import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, FileText, Clock, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import userService from '@/services/user/user.service'
import { DataAdminHome } from '@/types/user'
import { toast } from 'sonner'

const metricCardClass =
  'group rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_-36px_rgba(15,23,42,0.28)]'

export default function Dashboard() {
  const [data, setData] = useState<DataAdminHome | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasPendingCourses = false

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await userService.getAdminHome()
        if (!active) return
        setData(res.result ?? null)
      } catch (e: any) {
        if (!active) return
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải dữ liệu admin'
        setError(msg)
        toast.error(msg)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchData()
    return () => {
      active = false
    }
  }, [])

  const metricCards = [
    {
      title: 'Tổng khóa học',
      value: data?.courseCnt ?? (loading ? '…' : 0),
      icon: BookOpen,
      iconClass: 'bg-sky-50 text-sky-600',
      accentClass: 'from-sky-100/80 to-transparent'
    },
    {
      title: 'Giảng viên',
      value: data?.instructorCnt ?? (loading ? '…' : 0),
      icon: Users,
      iconClass: 'bg-violet-50 text-violet-600',
      accentClass: 'from-violet-100/80 to-transparent'
    },
    {
      title: 'Chứng chỉ chờ duyệt',
      value: data?.certificateCnt ?? (loading ? '…' : 0),
      icon: Clock,
      iconClass: 'bg-amber-50 text-amber-600',
      accentClass: 'from-amber-100/80 to-transparent'
    },
    {
      title: 'Bài blog',
      value: data?.blogCnt ?? (loading ? '…' : 0),
      icon: FileText,
      iconClass: 'bg-emerald-50 text-emerald-600',
      accentClass: 'from-emerald-100/80 to-transparent'
    }
  ]

  return (
    <div className='space-y-8'>
      <section className='relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-7 text-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.55)]'>
        <div className='absolute -right-6 top-0 h-44 w-44 rounded-full bg-sky-400/15 blur-3xl' />
        <div className='absolute bottom-0 left-12 h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl' />
        <div className='relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between'>
          <div className='max-w-2xl'>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/80'>Platform overview</p>
            <h1 className='mt-3 text-3xl font-semibold tracking-tight'>Tổng quan hệ thống</h1>
            <p className='mt-2 text-sm leading-6 text-slate-300'>
              Theo dõi những chỉ số quan trọng nhất của nền tảng trong một dashboard gọn, rõ và sẵn sàng cho vận hành
              hằng ngày.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className='rounded-[28px] border border-rose-200 bg-rose-50/80 px-6 py-5 text-sm font-medium text-rose-700'>
          {error}
        </div>
      ) : null}

      <section className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
        {metricCards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title} className={metricCardClass}>
              <CardHeader className='relative overflow-hidden pb-3'>
                <div
                  className={`absolute -right-10 top-0 h-24 w-24 rounded-full bg-gradient-to-br ${item.accentClass} blur-2xl`}
                />
                <div className='relative flex items-start justify-between gap-4'>
                  <div>
                    <CardDescription className='text-sm font-medium text-slate-500'>{item.title}</CardDescription>
                    <CardTitle className='mt-3 text-4xl font-semibold tracking-tight text-slate-950'>
                      {item.value}
                    </CardTitle>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClass}`}>
                    <Icon className='h-5 w-5' />
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </section>

      <section className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
        <Card className='overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.24)]'>
          <CardHeader className='border-b border-slate-200/80 bg-slate-50/80 px-6 py-5'>
            <div className='flex items-center gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600'>
                <Clock className='h-5 w-5' />
              </div>
              <div>
                <CardTitle className='text-lg font-semibold tracking-tight text-slate-950'>
                  Khóa học chờ duyệt
                </CardTitle>
                <CardDescription className='mt-1 text-sm text-slate-500'>
                  {data?.courseCnt ?? 0} khóa học đang chờ được xem xét
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='px-6 py-6'>
            {!hasPendingCourses ? (
              <div className='flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center'>
                <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400'>
                  <BookOpen className='h-6 w-6' />
                </div>
                <p className='mt-4 text-base font-medium text-slate-700'>Không có khóa học nào chờ duyệt</p>
                <p className='mt-2 max-w-md text-sm leading-6 text-slate-500'>
                  Khi có yêu cầu mới, khu vực này sẽ giúp bạn theo dõi và xử lý nhanh hơn.
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {[].map((course: any) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className='group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-sky-200 hover:bg-sky-50/40'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600'>
                        <BookOpen className='h-4 w-4' />
                      </div>
                      <div>
                        <p className='font-semibold text-slate-900 transition-colors group-hover:text-sky-700'>
                          {course.title}
                        </p>
                        <p className='mt-1 text-sm text-slate-500'>Người đăng: {course.instructor}</p>
                      </div>
                    </div>
                    <Badge variant='secondary' className='rounded-full border-amber-200 bg-amber-50 text-amber-700'>
                      Chờ duyệt
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.24)]'>
          <CardHeader className='border-b border-slate-200/80 bg-slate-50/80 px-6 py-5'>
            <div className='flex items-center gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600'>
                <Sparkles className='h-5 w-5' />
              </div>
              <div>
                <CardTitle className='text-lg font-semibold tracking-tight text-slate-950'>Điểm nhấn nhanh</CardTitle>
                <CardDescription className='mt-1 text-sm text-slate-500'>
                  Một số chỉ số nổi bật để nắm tình hình trong vài giây.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4 px-6 py-6'>
            <div className='rounded-2xl border border-slate-200 bg-slate-50/70 p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <p className='text-sm font-medium text-slate-500'>Nội dung đang quản lý</p>
                  <p className='mt-2 text-2xl font-semibold text-slate-950'>{data?.blogCnt ?? (loading ? '…' : 0)}</p>
                </div>
                <ArrowUpRight className='h-5 w-5 text-slate-400' />
              </div>
            </div>
            <div className='rounded-2xl border border-slate-200 bg-slate-50/70 p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <p className='text-sm font-medium text-slate-500'>Đội ngũ giảng viên</p>
                  <p className='mt-2 text-2xl font-semibold text-slate-950'>
                    {data?.instructorCnt ?? (loading ? '…' : 0)}
                  </p>
                </div>
                <ArrowUpRight className='h-5 w-5 text-slate-400' />
              </div>
            </div>
            <div className='rounded-2xl border border-slate-200 bg-slate-50/70 p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <p className='text-sm font-medium text-slate-500'>Yêu cầu chứng chỉ</p>
                  <p className='mt-2 text-2xl font-semibold text-slate-950'>
                    {data?.certificateCnt ?? (loading ? '…' : 0)}
                  </p>
                </div>
                <ArrowUpRight className='h-5 w-5 text-slate-400' />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
