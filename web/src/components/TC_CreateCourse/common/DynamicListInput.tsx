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
  onChange: (newItems: string[]) => void
}

function DynamicListInput({ title, placeholder, items = [], icon, onChange }: DynamicListInputProps) {
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
    <Card className='border border-blue-200 shadow-sm bg-blue-50'>
      <CardHeader className='bg-blue-200/40 rounded-t-lg'>
        <CardTitle className='text-lg font-medium text-blue-900 flex items-center'>
          {icon && <span className='mr-2'>{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* List items */}
        <ul className='list-disc list-inside space-y-4'>
          {items.map((item, index) => (
            <li
              key={index}
              className='flex items-center gap-2 justify-between bg-blue-200 p-2 rounded-lg text-blue-950 text-base'
            >
              <BadgeCheck className='h-5 w-5 text-blue-700' />
              <span className='flex-1 pr-2 break-words'>{item}</span>
              <X
                className='h-6 w-6 flex-shrink-0 text-blue-500 hover:text-red-500 cursor-pointer'
                onClick={() => removeItem(index)}
              />
            </li>
          ))}
        </ul>

        {/* Input + Button */}
        <div className='flex space-x-2'>
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            className='border-blue-300 focus:ring-2 focus:ring-blue-400 rounded-lg'
          />
          <Button
            onClick={addItem}
            disabled={!newItem}
            className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'
          >
            Thêm
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default DynamicListInput
