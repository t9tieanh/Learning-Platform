import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BadgeCheck, X } from 'lucide-react'

type DynamicListInputProps = {
  title: string
  placeholder: string
  items: string[]
  icon?: React.ReactNode
  description?: string
  onChange: (newItems: string[]) => void
}

function DynamicListInput({ title, placeholder, items = [], description, icon, onChange }: DynamicListInputProps) {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (!newItem.trim()) return
    onChange([...items, newItem.trim()])
    setNewItem('')
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <Card className='border-2 border-white ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] overflow-hidden'>
      <CardHeader className='pb-4 border-b border-gray-50/50'>
        <CardTitle className='text-[15px] font-bold text-gray-900 flex flex-row items-center gap-2.5'>
          {icon && <div className='p-2 bg-blue-50/30 rounded-xl text-blue-600 border border-blue-50'>{icon}</div>}
          <div className='flex flex-col'>
            {title}
            <p className='text-[11.5px] font-medium text-gray-400 mt-0.5'>{description}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* List items */}
        <ul className='space-y-2.5 mt-2'>
          {items.map((item, index) => (
            <li
              key={index}
              className='flex items-center gap-3 justify-between bg-gray-50/40 p-3 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:border-blue-100'
            >
              <div className='w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50 shrink-0'>
                <BadgeCheck className='h-3 w-3 text-blue-600' />
              </div>
              <span className='flex-1 pr-2 break-words text-[13px] font-medium text-gray-700'>{item}</span>
              <X
                className='h-4 w-4 flex-shrink-0 text-gray-300 hover:text-red-500 cursor-pointer transition-all hover:scale-110 opacity-0 group-hover:opacity-100'
                onClick={() => removeItem(index)}
              />
            </li>
          ))}
        </ul>

        {/* Input + Button */}
        <div className='flex gap-2.5 pt-2'>
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            className='h-10 text-[13px] font-medium border-gray-100 bg-gray-50/20 focus:bg-white transition-all rounded-xl placeholder:text-gray-300'
          />
          <Button
            onClick={addItem}
            disabled={!newItem}
            className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-10 text-[11px] font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all'
          >
            Thêm
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default DynamicListInput
