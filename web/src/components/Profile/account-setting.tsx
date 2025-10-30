import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Shield, Mail, Bell, Download, Trash2 } from 'lucide-react'

const AccountSetting = () => {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-base font-semibold text-white bg-gradient-to-r from-primary to-purple-600 px-6 py-3 rounded-2xl shadow-lg tracking-tight'>
          Cài đặt tài khoản
        </h2>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Bảo mật */}
        <Card className='border border-border shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl'>
          <CardHeader>
            <CardTitle className='text-lg font-semibold'>🔒 Bảo mật</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button variant='outline' className='w-full justify-start gap-2 hover:bg-primary p-6 rounded-xl'>
              <Lock className='w-4 h-4' />
              Đổi mật khẩu
            </Button>
            <Button variant='outline' className='w-full justify-start gap-2 hover:bg-primary p-6 rounded-xl'>
              <Shield className='w-4 h-4' />
              Xác thực hai yếu tố
            </Button>
          </CardContent>
        </Card>

        {/* Thông báo */}
        <Card className='border border-border shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl'>
          <CardHeader>
            <CardTitle className='text-lg font-semibold'>🔔 Thông báo</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button variant='outline' className='w-full justify-start gap-2 hover:bg-primary p-6 rounded-xl'>
              <Mail className='w-4 h-4' />
              Cài đặt email thông báo
            </Button>
            <Button variant='outline' className='w-full justify-start gap-2 hover:bg-primary p-6 rounded-xl'>
              <Bell className='w-4 h-4' />
              Thông báo đẩy
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AccountSetting
