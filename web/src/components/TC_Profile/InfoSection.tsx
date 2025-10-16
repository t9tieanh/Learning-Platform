import { useState } from 'react'
import { Phone, Mail, User, Calendar, Edit3, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Teacher {
  id: string
  name: string
  username: string
  email: string
  phone: string
  avatar?: string
  specialization?: string
  date?: string
}

interface ContactInfoSectionProps {
  teacher: Teacher
  onUpdateTeacher?: (updatedTeacher: Teacher) => void
  className?: string
}

export function InfoSection({ teacher, onUpdateTeacher, className = '' }: ContactInfoSectionProps) {
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [editedTeacher, setEditedTeacher] = useState<Teacher>(teacher)

  const handleSaveProfile = () => {
    onUpdateTeacher?.(editedTeacher)
    setEditProfileOpen(false)
  }
  return (
    <div className='space-y-2'>
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground leading-tight'>{teacher.name}</h1>
          {teacher.specialization && <p className='text-base text-muted-foreground'>{teacher.specialization}</p>}
        </div>

        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogTrigger asChild>
            <Button variant='outline' size='sm' className='gap-2'>
              <Edit3 className='w-4 h-4' />
              Chỉnh sửa
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin giáo viên</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='edit-name'>Họ và tên</Label>
                  <Input
                    id='edit-name'
                    value={editedTeacher.name}
                    onChange={(e) => setEditedTeacher({ ...editedTeacher, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor='edit-username'>Tên đăng nhập</Label>
                  <Input
                    id='edit-username'
                    value={editedTeacher.username}
                    onChange={(e) => setEditedTeacher({ ...editedTeacher, username: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='edit-email'>Email</Label>
                <Input
                  id='edit-email'
                  type='email'
                  value={editedTeacher.email}
                  onChange={(e) => setEditedTeacher({ ...editedTeacher, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor='edit-phone'>Số điện thoại</Label>
                <Input
                  id='edit-phone'
                  value={editedTeacher.phone}
                  onChange={(e) => setEditedTeacher({ ...editedTeacher, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor='edit-specialization'>Chuyên môn</Label>
                <Input
                  id='edit-specialization'
                  value={editedTeacher.specialization || ''}
                  onChange={(e) => setEditedTeacher({ ...editedTeacher, specialization: e.target.value })}
                />
              </div>

              <div className='flex gap-2 justify-end pt-4'>
                <Button variant='outline' onClick={() => setEditProfileOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSaveProfile}>
                  <Save className='w-4 h-4 mr-2' />
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Info */}
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='flex items-center gap-3 p-4 rounded-lg bg-white border-2 border-blue-100 hover:bg-blue-100 transition-colors'>
          <div className='p-2 rounded-md bg-primary/10'>
            <Phone className='w-4 h-4 text-primary' />
          </div>
          <div>
            <div className='text-sm font-medium text-muted-foreground'>Điện thoại</div>
            <div className='text-foreground text-lg font-semibold'>{teacher.phone}</div>
          </div>
        </div>

        <div className='flex items-center gap-3 p-4 rounded-lg bg-white border-2 border-blue-100 hover:bg-blue-100 transition-colors'>
          <div className='p-2 rounded-md bg-primary/10'>
            <Mail className='w-4 h-4 text-primary' />
          </div>
          <div>
            <div className='text-sm font-medium text-muted-foreground'>Email</div>
            <div className='text-foreground text-lg font-semibold break-all'>{teacher.email}</div>
          </div>
        </div>

        <div className='flex items-center gap-3 p-4 rounded-lg bg-white border-2 border-blue-100 hover:bg-blue-100 transition-colors'>
          <div className='p-2 rounded-md bg-primary/10'>
            <User className='w-4 h-4 text-primary' />
          </div>
          <div>
            <div className='text-sm font-medium text-muted-foreground'>Tên đăng nhập</div>
            <div className='text-foreground text-lg font-semibold'>@{teacher.username}</div>
          </div>
        </div>

        <div className='flex items-center gap-3 p-4 rounded-lg bg-white border-2 border-blue-100 hover:bg-blue-100 transition-colors'>
          <div className='p-2 rounded-md bg-primary/10'>
            <Calendar className='w-4 h-4 text-primary' />
          </div>
          <div>
            <div className='text-sm font-medium text-muted-foreground'>Ngày tham gia</div>
            <div className='text-foreground text-lg font-semibold'>{teacher.date}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
