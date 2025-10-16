import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Save, GraduationCap } from 'lucide-react'

interface AvatarSectionProps {
  avatar?: string
  name: string
  initials: string
  onSaveAvatar: (newUrl: string) => void
}

export function AvatarSection({ avatar, name, initials, onSaveAvatar }: AvatarSectionProps) {
  const [editAvatarOpen, setEditAvatarOpen] = useState(false)
  const [newAvatarUrl, setNewAvatarUrl] = useState(avatar || '')

  const handleSave = () => {
    onSaveAvatar(newAvatarUrl)
    setEditAvatarOpen(false)
  }

  return (
    <div className='flex-shrink-0 flex flex-col items-center lg:items-start'>
      <div className='relative group'>
        <Avatar className='w-12 h-12 lg:w-20 lg:h-20 ring-4 ring-primary/10'>
          <AvatarImage src={avatar} alt={name} className='object-cover rounded-full' />
          <AvatarFallback className='bg-profile-gradient text-primary-foreground text-xl lg:text-2xl font-semibold'>
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Edit Avatar Button */}
        <Dialog open={editAvatarOpen} onOpenChange={setEditAvatarOpen}>
          <DialogTrigger asChild>
            <Button
              size='sm'
              className='absolute -bottom-0 w-12 h-12 lg:w-20 lg:h-20 rounded-full 
                         bg-slate-300 hover:bg-slate-200/90 opacity-0 
                         group-hover:opacity-100 transition-opacity shadow-lg'
            >
              <Camera className='w-4 h-4' />
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa Avatar</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='avatar-url'>URL Ảnh đại diện</Label>
                <Input
                  id='avatar-url'
                  placeholder='https://example.com/avatar.jpg'
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  className='mt-4'
                />
              </div>
              <div className='flex items-center justify-center'>
                <Avatar className='w-20 h-20'>
                  <AvatarImage src={newAvatarUrl} alt='Preview' />
                  <AvatarFallback className='bg-profile-gradient text-primary-foreground'>{initials}</AvatarFallback>
                </Avatar>
              </div>
              <div className='flex gap-2 justify-end'>
                <Button variant='outline' onClick={() => setEditAvatarOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSave}>
                  <Save className='w-4 h-4 mr-2' />
                  Lưu
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Badge */}
        <div className='absolute -bottom-2 -right-6'>
          <Badge variant='secondary' className='bg-green-300/90 text-green-600 p-1 rounded-lg font-medium'>
            <GraduationCap className='w-3 h-3 mr-1' />
            Instructor
          </Badge>
        </div>
      </div>
    </div>
  )
}
