import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { AvatarSection } from './AvatarSection'
import { InfoSection } from './InfoSection'
import { CertificateSection } from './CertificationSection'

interface Certificate {
  id: string
  name: string
  image: string
  dateReceived: string
}

interface Teacher {
  id: string
  name: string
  username: string
  email: string
  phone: string
  avatar?: string
  specialization?: string
  date?: string
  certificates?: Certificate[]
}

interface TeacherProfileProps {
  teacher: Teacher
  onUpdateTeacher?: (updatedTeacher: Teacher) => void
  className?: string
}

export function TeacherProfile({ teacher, onUpdateTeacher, className = '' }: TeacherProfileProps) {
  const [editedTeacher, setEditedTeacher] = useState<Teacher>(teacher)

  const initials = teacher.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <Card className={`shadow-card hover:shadow-card-hover transition-all duration-300 ${className}`}>
      <CardContent className='p-8'>
        <div className='flex flex-col lg:flex-row gap-8'>
          <AvatarSection
            avatar={teacher?.avatar}
            name={teacher?.name}
            initials={initials}
            onSaveAvatar={(url) => {
              const updatedTeacher = { ...teacher, avatar: url }
              onUpdateTeacher?.(updatedTeacher)
              setEditedTeacher(updatedTeacher)
            }}
          />

          {/* Profile Information */}
          <div className='flex-1 space-y-6'>
            <InfoSection teacher={teacher} onUpdateTeacher={onUpdateTeacher} className='' />
            <CertificateSection
              teacher={teacher}
              setEditedTeacher={setEditedTeacher}
              onUpdateTeacher={onUpdateTeacher}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TeacherProfile
