import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CustomButton from '@/components/common/Button'
import { Mail, Phone, Calendar, User, Camera } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { FaUserEdit } from 'react-icons/fa'
import userService from '@/services/user/user.service'
import { Profile } from '@/types/profile'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/useAuth.stores'
import CertificateList from './CertificateList'
import { Separator } from '@radix-ui/react-dropdown-menu'
const PersonalInfo = () => {
  const [userInfo, setUserInfo] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    // Fetch additional user info if needed
    const fetchUserInfo = async () => {
      try {
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
      }
    }

    fetchUserInfo()
  }, [])

  // Trigger file picker and handle avatar change (logic to be implemented later)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleAvatarChange = (e?: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0]
    if (!file) return
    setForm((prev) => ({ ...prev, imageFile: file }))
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

  const handleSave = async () => {
    if (!userId) {
      toast.error('Không xác định được người dùng')
      return
    }
    if (!hasChanges) return
    try {
      setSaving(true)
      const res = await userService.updateUser(String(userId), {
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
    <div className='space-y-6 shadow-sm rounded-xl'>
      <Card className='hover:bg-profile-card-hover transition-colors rounded-xl shadow-md'>
        <CardContent className='px-8'>
          <div className='flex gap-4 items-center text-center mb-8 px-4 py-6 rounded-xl bg-[#0C356A]'>
            <div className='relative'>
              {editing ? (
                <>
                  <button
                    type='button'
                    className='group relative block rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50'
                    onClick={() => fileInputRef.current?.click()}
                    aria-label='Chọn ảnh đại diện mới'
                  >
                    <Avatar className='h-28 w-28 shadow-lg cursor-pointer'>
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
                  <Avatar className='h-28 w-28 shadow-lg'>
                    <AvatarImage src={userInfo?.image} alt={userInfo?.name} className='object-cover' />
                    <AvatarFallback className='text-lg font-semibold bg-primary text-primary-foreground'>
                      <User className='h-6 w-6' />
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            <div>
              <h3 className='text-3xl font-bold flex text-white mb-1'>{userInfo?.name}</h3>
              <p className='text-sm text-slate-300 text-start'>@{userInfo?.username}</p>
            </div>
          </div>

          {/* Info Grid */}
          <h2 className='font-semibold text-base my-4'>Thông tin cơ bản</h2>
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
              {userInfo?.description || 'Chưa có mô tả cá nhân.'}
            </div>
          ) : (
            <textarea
              className='w-full min-h-[120px] text-sm pb-4 text-foreground/90 leading-relaxed border-2 p-4 rounded-lg bg-white'
              value={form.description || ''}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
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
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
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
  )
}

export default PersonalInfo
