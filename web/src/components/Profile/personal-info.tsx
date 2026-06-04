import QuillEditor from '@/components/common/Input/QuillEditor'
import { useEffect, useMemo, useRef, useState } from 'react'
import type Quill from 'quill'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CustomButton from '@/components/common/Button'
import { Mail, Phone, Calendar, User, Camera, Send, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { FaUserEdit } from 'react-icons/fa'
import userService from '@/services/user/user.service'
import { Profile } from '@/types/profile'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/useAuth.stores'
import CertificateList from './CertificateList'
import PersonalInfoSkeleton from './PersonalInfoSkeleton'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { useVipUpgrade } from '@/contexts/VipUpgradeContext'
import HighGlossBackground from '@/components/common/HighGlossBackground'

const DESCRIPTION_MAX_LENGTH = 100

const PersonalInfo = () => {
  const [userInfo, setUserInfo] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [descriptionLimitError, setDescriptionLimitError] = useState(false)
  const [form, setForm] = useState<{
    name?: string
    email?: string
    phone?: string | null
    position?: string | null
    description?: string
    imageFile?: File | null
  }>({})
  const { data, setData } = useAuthStore()
  const userId = (data as any)?.userId || (data as any)?.id
  const { openVipDialog } = useVipUpgrade()

  /** Username / email dưới tên: không thêm @ nếu đã là email */
  const profileHandleLine = useMemo(() => {
    const raw = userInfo?.username?.trim()
    if (!raw) return null
    const normalized = raw.replace(/^@+/, '')
    if (normalized.includes('@')) return normalized
    return `@${normalized}`
  }, [userInfo?.username])

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true)
        const response = await userService.getProfile()
        if (response && response.result && response.code === 200) {
          setUserInfo(response.result)
          setForm({
            name: response.result.name,
            email: response.result.email,
            phone: response.result.phone ?? '',
            position: response.result.position ?? '',
            description: response.result.description ?? ''
          })
        } else {
          toast.error(response.message || 'Đã có lỗi xảy ra khi tải thông tin cá nhân.')
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
        toast.error('Đã có lỗi xảy ra khi tải thông tin cá nhân.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  // Trigger file picker and handle avatar change (logic to be implemented later)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const descriptionEditorRef = useRef<Quill | null>(null)
  const hasShownDescriptionLimitToastRef = useRef(false)
  const AVATAR_MAX_BYTES = 5 * 1024 * 1024

  const handleAvatarChange = (e?: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0]
    if (!file) return
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error('Ảnh đại diện tối đa 5MB')
      if (e?.target) e.target.value = ''
      return
    }
    setForm((prev) => ({ ...prev, imageFile: file }))
  }

  const handleDescriptionChange = (html: string) => {
    const quill = descriptionEditorRef.current
    if (quill) {
      const textLength = quill.getLength() - 1
      if (textLength > DESCRIPTION_MAX_LENGTH) {
        quill.deleteText(DESCRIPTION_MAX_LENGTH, textLength - DESCRIPTION_MAX_LENGTH)
        setDescriptionLimitError(true)
        if (!hasShownDescriptionLimitToastRef.current) {
          hasShownDescriptionLimitToastRef.current = true
        }
        setForm((p) => ({ ...p, description: quill.root.innerHTML }))
        return
      }
      if (textLength < DESCRIPTION_MAX_LENGTH) {
        setDescriptionLimitError(false)
        hasShownDescriptionLimitToastRef.current = false
      }
    }
    setForm((p) => ({ ...p, description: html }))
  }

  const hasChanges = useMemo(() => {
    if (!userInfo) return false
    return (
      form.name !== userInfo.name ||
      form.email !== userInfo.email ||
      (form.phone ?? '') !== (userInfo.phone ?? '') ||
      (form.position ?? '') !== (userInfo.position ?? '') ||
      (form.description ?? '') !== (userInfo.description ?? '') ||
      !!form.imageFile
    )
  }, [form, userInfo])

  const handleSaveProfile = async () => {
    if (!hasChanges) return
    try {
      setSaving(true)
      const res = await userService.updateUser({
        name: form.name,
        email: form.email,
        phone: form.phone ?? undefined,
        position: form.position ?? undefined,
        description: form.description,
        imageFile: form.imageFile || null
      })
      if (res?.result) {
        setUserInfo(res.result)
        setEditing(false)
        setForm((prev) => ({ ...prev, imageFile: undefined }))
        // Sync auth store so Header updates avatar and name immediately
        if (data && setData) {
          setData({
            ...data,
            name: res.result.name ?? data.name,
            email: res.result.email ?? data.email,
            username: (res.result as any)?.username ?? data.username,
            avatarUrl: (res.result as any)?.image ?? data.avatarUrl
          })
        }
        toast.success('Cập nhật thông tin thành công')
      } else {
        toast.error(res?.message || 'Cập nhật thất bại')
      }
    } catch (e) {
      console.error(e)
      toast.error('Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {loading ? (
        <PersonalInfoSkeleton />
      ) : (
        <div className='space-y-6 shadow-sm rounded-xl'>
          <Card className='hover:bg-profile-card-hover transition-colors rounded-xl shadow-md'>
            <CardContent className='px-6 sm:px-8 pt-6'>
              <HighGlossBackground className='mb-10 rounded-xl px-6 py-9 md:px-10 md:py-10'>
                <div className='flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8'>
                  <div className='relative shrink-0'>
                    {editing ? (
                      <>
                        <button
                          type='button'
                          className='group relative block rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50'
                          onClick={() => fileInputRef.current?.click()}
                          aria-label='Chọn ảnh đại diện mới'
                        >
                          <Avatar
                            className={`h-20 md:h-28 w-20 md:w-28 shadow-lg cursor-pointer ${userInfo?.isVip ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-[#0C356A]' : ''
                              }`}
                          >
                            <AvatarImage
                              src={form.imageFile ? URL.createObjectURL(form.imageFile) : userInfo?.image}
                              alt={userInfo?.name}
                              className='object-cover'
                            />
                            <AvatarFallback className='text-lg font-semibold bg-primary text-primary-foreground'>
                              <User className='h-6 w-6' />
                            </AvatarFallback>
                          </Avatar>
                          <div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                            <Camera className='w-6 h-6 text-white' />
                          </div>
                          {userInfo?.isVip && (
                            <div className='absolute bottom-0 right-0 z-10 rounded-full border-2 border-[#0C356A] bg-gradient-to-r from-yellow-400 to-yellow-600 p-1.5 shadow-sm'>
                              <Crown className='h-4 w-4 text-white md:h-5 md:w-5' strokeWidth={2.5} />
                            </div>
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          id='avatarUpload'
                          type='file'
                          accept='image/*'
                          className='hidden'
                          onChange={handleAvatarChange}
                        />
                      </>
                    ) : (
                      <div className='relative'>
                        <Avatar
                          className={`h-20 md:h-28 w-20 md:w-28 shadow-lg ${userInfo?.isVip ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-[#0C356A]' : ''
                            }`}
                        >
                          <AvatarImage src={userInfo?.image} alt={userInfo?.name} className='object-cover' />
                          <AvatarFallback className='text-lg font-semibold bg-primary text-primary-foreground'>
                            <User className='h-6 w-6' />
                          </AvatarFallback>
                        </Avatar>
                        {userInfo?.isVip && (
                          <div className='absolute bottom-0 right-0 z-10 rounded-full border-2 border-[#0C356A] bg-gradient-to-r from-yellow-400 to-yellow-600 p-1.5 shadow-sm'>
                            <Crown className='h-4 w-4 text-white md:h-5 md:w-5' strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className='flex min-w-0 flex-1 flex-col items-center gap-3 text-center md:items-start md:gap-2.5 md:text-left'>
                    <div className='flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 md:justify-start'>
                      <h3 className='max-w-full text-lg font-bold leading-tight text-white md:text-3xl'>
                        {userInfo?.name}
                      </h3>
                      {userInfo?.isVip && (
                        <span className='inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gradient-to-r from-yellow-400 to-yellow-600 px-2.5 py-1 text-xs font-bold uppercase leading-none text-white shadow-sm md:text-sm'>
                          <Crown className='h-3.5 w-3.5 md:h-4 md:w-4' strokeWidth={2.5} />
                          VIP
                        </span>
                      )}
                    </div>
                    {profileHandleLine && (
                      <p className='w-full max-w-full truncate text-xs text-slate-300 md:text-sm'>{profileHandleLine}</p>
                    )}

                    {!userInfo?.isVip && (
                      <CustomButton
                        label='Tìm hiểu Learnova VIP'
                        icon={<Crown className='h-4 w-4 shrink-0 text-yellow-600' />}
                        className='mt-0.5 h-8 border-none bg-gradient-to-r from-yellow-100 to-amber-100 px-4 text-xs font-semibold text-yellow-800 shadow-sm transition-transform hover:scale-105 hover:from-yellow-200 hover:to-amber-200 rounded-full'
                        onClick={openVipDialog}
                        type='button'
                      />
                    )}
                  </div>
                </div>
              </HighGlossBackground>

              {/* Info Grid */}
              <h2 className='mt-2 mb-4 text-base font-semibold'>Thông tin cơ bản</h2>
              {!editing ? (
                <div className='grid gap-4 md:grid-cols-2'>
                  {/* Name */}
                  <div className='flex items-center border-2 gap-3 p-4 rounded-lg bg-white hover:bg-blue-100 transition-colors'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <User className='w-4 h-4 text-primary' />
                    </div>
                    <div>
                      <div className='text-sm font-medium text-muted-foreground'>Họ và tên</div>
                      <div className='text-foreground text-sm font-sm'>{userInfo?.name || ''}</div>
                    </div>
                  </div>
                  {/* Email */}
                  <div className='flex items-center border-2 gap-3 p-4 rounded-lg bg-white hover:bg-blue-100 transition-colors'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <Mail className='w-4 h-4 text-primary' />
                    </div>
                    <div>
                      <div className='text-sm font-medium text-muted-foreground'>Email</div>
                      <div className='text-foreground text-sm font-sm'>{userInfo?.email || ''}</div>
                    </div>
                  </div>
                  {/* Phone */}
                  <div className='flex items-center border-2 gap-3 p-4 rounded-lg bg-white hover:bg-blue-100 transition-colors'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <Phone className='w-4 h-4 text-primary' />
                    </div>
                    <div>
                      <div className='text-sm font-medium text-muted-foreground'>Điện thoại</div>
                      <div className='text-foreground text-sm font-sm'>{userInfo?.phone || ''}</div>
                    </div>
                  </div>
                  {/* Position */}
                  <div className='flex items-center border-2 gap-3 p-4 rounded-lg bg-white hover:bg-blue-100 transition-colors'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <Calendar className='w-4 h-4 text-primary' />
                    </div>
                    <div>
                      <div className='text-sm font-medium text-muted-foreground'>Vị trí</div>
                      <div className='text-foreground text-sm font-sm'>{userInfo?.position || ''}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='grid gap-4 md:grid-cols-2'>
                  {/* Name editable */}
                  <div className='flex items-center border-2 gap-3 p-4 rounded-lg bg-white'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <User className='w-4 h-4 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-medium text-muted-foreground'>Họ và tên</div>
                      <input
                        className='text-sm w-full px-3 py-2 rounded-md border'
                        value={form.name || ''}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                  </div>
                  {/* Email editable */}
                  <div className='flex items-center border-2 gap-3 p-4 rounded-lg bg-white'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <Mail className='w-4 h-4 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-medium text-muted-foreground'>Email</div>
                      <input
                        className='text-sm w-full px-3 py-2 rounded-md border'
                        value={form.email || ''}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  {/* Phone editable */}
                  <div className='flex items-center border-2 gap-3 p-4 rounded-lg bg-white'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <Phone className='w-4 h-4 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-medium text-muted-foreground'>Điện thoại</div>
                      <input
                        className='text-sm w-full px-3 py-2 rounded-md border'
                        value={form.phone || ''}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  {/* Position editable */}
                  <div className='flex items-center border-2 gap-3 p-4 rounded-lg bg-white'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <Calendar className='w-4 h-4 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-medium text-muted-foreground'>Vị trí</div>
                      <input
                        className='text-sm w-full px-3 py-2 rounded-md border'
                        value={form.position || ''}
                        onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                      />
                    </div>
                  </div>
                  {/* Username read only */}
                  <div className='flex items-center border-2 gap-3 p-4 rounded-lg bg-white opacity-60'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <User className='w-4 h-4 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-medium text-muted-foreground'>Tên đăng nhập</div>
                      <div className='text-foreground text-sm font-sm'>{userInfo?.username || ''}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <h2 className='font-semibold text-base my-4'>Mô tả</h2>
              {!editing ? (
                <div className='text-sm pb-4 text-foreground/90 leading-relaxed border-2 p-4 rounded-lg bg-white'>
                  {userInfo?.description ? (
                    <span dangerouslySetInnerHTML={{ __html: userInfo.description }} />
                  ) : (
                    'Chưa có mô tả cá nhân.'
                  )}
                </div>
              ) : (
                <>
                  <QuillEditor
                    ref={descriptionEditorRef}
                    initialHtml={form.description || ''}
                    onChange={handleDescriptionChange}
                    className='min-h-[300px] bg-white rounded-lg border-2 p-2'
                  />
                  {descriptionLimitError && (
                    <p className='mt-2 text-sm text-red-500'>Mô tả tối đa 100 ký tự, không thể nhập thêm.</p>
                  )}
                </>
              )}

              <div className='flex justify-end mt-8 gap-3'>
                {!editing ? (
                  <CustomButton
                    className='hover:bg-primary-hover shadow-lg hover:scale-105'
                    label='Chỉnh sửa'
                    icon={<FaUserEdit className='h-5 w-5' />}
                    onClick={() => setEditing(true)}
                  />
                ) : (
                  <>
                    <CustomButton
                      className='shadow hover:opacity-90'
                      label={saving ? 'Đang lưu...' : 'Lưu'}
                      onClick={handleSaveProfile}
                      disabled={!hasChanges || saving}
                      icon={<Send className='w-4 h-4' />}
                    />
                    <CustomButton
                      className='shadow'
                      label='Hủy'
                      onClick={() => {
                        setEditing(false)
                        setForm({
                          name: userInfo?.name,
                          email: userInfo?.email,
                          phone: userInfo?.phone ?? '',
                          position: userInfo?.position ?? '',
                          description: userInfo?.description ?? '',
                          imageFile: undefined
                        })
                      }}
                    />
                  </>
                )}
              </div>
            </CardContent>

            <Separator className='mx-10 bg-gray-300 h-[2px]' />
            <div className='px-8'>{userId && <CertificateList userId={String(userId)} />}</div>
          </Card>
        </div>
      )}
    </>
  )
}

export default PersonalInfo
