import { Badge } from '@/components/ui/badge'

interface ProfileHeaderProps {
  name: string
  expertise?: string[]
  badges?: { image?: string; label: string }[]
}

export const ProfileHeader = ({ name, expertise = [], badges = [] }: ProfileHeaderProps) => {
  return (
    <div className='space-y-5'>
      <p className='text-sm font-medium text-blue-500 uppercase tracking-wide'>Giảng viên</p>

      {/* Name */}
      <h1 className='text-4xl font-bold text-foreground'>{name}</h1>

      {/* Expertise List */}
      {expertise.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {expertise.map((e, idx) => (
            <Badge key={idx} variant='secondary' className='bg-muted/40 text-foreground hover:bg-muted/60 text-sm'>
              {e}
            </Badge>
          ))}
        </div>
      )}

      {/* Badges (bigger, with image) */}
      {badges.length > 0 && (
        <div className='flex flex-wrap gap-3'>
          {badges.map((b, idx) => (
            <Badge
              key={idx}
              className='bg-primary/10 text-primary border-primary/20 flex items-center gap-2 py-1.5 hover:bg-primary/20'
            >
              {b.image && <img src={b.image} alt='' className='w-9 h-5 rounded' />}
              {b.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
