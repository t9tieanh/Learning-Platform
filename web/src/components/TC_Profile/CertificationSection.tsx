import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Save, Award, Plus, Calendar } from 'lucide-react'
import { useState } from 'react'

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

interface CertificationProps {
  teacher: Teacher
  onUpdateTeacher?: (updatedTeacher: Teacher) => void
  className?: string
  setEditedTeacher: React.Dispatch<React.SetStateAction<Teacher>>
}

export function CertificateSection({ teacher, onUpdateTeacher, setEditedTeacher, className = '' }: CertificationProps) {
  const [newCertificate, setNewCertificate] = useState<Omit<Certificate, 'id'>>({
    name: '',
    image: '',
    dateReceived: ''
  })

  const handleAddCertificate = () => {
    if (!newCertificate.name || !newCertificate.image || !newCertificate.dateReceived) {
      return
    }

    const certificate: Certificate = {
      id: Date.now().toString(),
      ...newCertificate
    }

    const updatedTeacher = {
      ...teacher,
      certificates: [...(teacher.certificates || []), certificate]
    }

    onUpdateTeacher?.(updatedTeacher)
    setEditedTeacher(updatedTeacher)
    setNewCertificate({ name: '', image: '', dateReceived: '' })
  }
  return (
    <div className='pt-6 border-t border-border'>
      <Tabs defaultValue='certificates' className='w-full'>
        <TabsContent value='certificates' className='mt-6'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Chứng chỉ & Giải thưởng</h3>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size='sm' className='gap-2'>
                    <Plus className='w-4 h-4' />
                    Thêm chứng chỉ
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Thêm chứng chỉ mới</DialogTitle>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='cert-name'>Tên chứng chỉ</Label>
                      <Input
                        id='cert-name'
                        placeholder='VD: Chứng chỉ Google Analytics'
                        value={newCertificate.name}
                        onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor='cert-image'>URL hình ảnh chứng chỉ</Label>
                      <Input
                        id='cert-image'
                        placeholder='https://example.com/certificate.jpg'
                        value={newCertificate.image}
                        onChange={(e) => setNewCertificate({ ...newCertificate, image: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor='cert-date'>Ngày nhận</Label>
                      <Input
                        id='cert-date'
                        type='date'
                        value={newCertificate.dateReceived}
                        onChange={(e) => setNewCertificate({ ...newCertificate, dateReceived: e.target.value })}
                      />
                    </div>

                    {newCertificate.image && (
                      <div className='space-y-2'>
                        <Label>Xem trước</Label>
                        <div className='border rounded-lg p-2'>
                          <img
                            src={newCertificate.image}
                            alt='Preview'
                            className='w-full h-32 object-cover rounded'
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className='flex gap-2 justify-end'>
                      <Button variant='outline'>Hủy</Button>
                      <Button onClick={handleAddCertificate}>
                        <Save className='w-4 h-4 mr-2' />
                        Thêm chứng chỉ
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {teacher.certificates && teacher.certificates.length > 0 ? (
                teacher.certificates.map((cert) => (
                  <Card key={cert.id} className='overflow-hidden hover:shadow-md transition-shadow'>
                    <div className='aspect-video bg-muted relative'>
                      <img
                        src={cert.image}
                        alt={cert.name}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className='absolute top-2 right-2'>
                        <Badge variant='secondary' className='bg-background/80 backdrop-blur-sm'>
                          <Award className='w-3 h-3 mr-1' />
                          Chứng chỉ
                        </Badge>
                      </div>
                    </div>
                    <CardContent className='p-4'>
                      <h4 className='font-semibold text-sm mb-2 line-clamp-2'>{cert.name}</h4>
                      <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                        <Calendar className='w-3 h-3' />
                        {new Date(cert.dateReceived).toLocaleDateString('vi-VN')}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className='col-span-full text-center py-8 text-muted-foreground'>
                  <Award className='w-12 h-12 mx-auto mb-3 opacity-50' />
                  <p>Chưa có chứng chỉ nào được thêm</p>
                  <p className='text-sm'>Nhấn &rdquo;Thêm chứng chỉ&rdquo; để thêm chứng chỉ đầu tiên</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
