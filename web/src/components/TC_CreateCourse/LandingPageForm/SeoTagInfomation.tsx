/* eslint-disable prettier/prettier */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useState } from 'react'
import { Props as CommonProps } from '@/utils/common/reactHookFormProps'
import CustomTag from '@/components/common/CustomTag'
import useTags from '@/hooks/useTags.hook'

const SeoTagInfomation = ({ register, control, errors, setValue, getValues }: CommonProps) => {
  const tags = getValues('tags') || []
  const [newTag, setNewTag] = useState('')
  const availableTags = useTags()

  const addTag = () => {
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      setValue('tags', [...tags, newTag])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setValue(
      'tags',
      tags.filter((tag: string) => tag !== tagToRemove)
    )
  }

  return (
    <>
      <Card className='border border-blue-200 shadow-md bg-blue-50'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold text-blue-900'>Thẻ khóa học</CardTitle>
          <p className='text-sm text-blue-700'>Thêm thẻ liên quan đến kỹ năng được dạy trong khóa.</p>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Tags list */}
          <div className='flex flex-wrap gap-2 mb-4'>
            {
              availableTags?.map((tag) => (
                <CustomTag
                  key={tag.id}
                  label={tag.name}
                  imageUri={tag.imageUrl}
                  checked={tags.includes(tag.id)}
                  onChange={(checked: boolean) => {
                    if (checked) {
                      // Add tag
                      if (!tags.includes(tag.id) && tags.length < 10) {
                        setValue('tags', [...tags, tag.id])
                      }
                    } else {
                      // Remove tag
                      removeTag(tag.id)
                    }
                  }}
                />
              ))
            }
          </div>

          {/* Input + Button */}
          <div className='flex space-x-2'>
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder='Thêm thẻ'
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              className='border-blue-300 focus:ring-2 focus:ring-blue-400 rounded-lg'
            />
            <Button
              onClick={addTag}
              disabled={!newTag || tags.length >= 10}
              className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'
            >
              Thêm
            </Button>
          </div>

          {/* Counter */}
          <div className='text-xs text-blue-600'>{tags.length}/10 thẻ đã dùng</div>
        </CardContent>
      </Card>
    </>
  )
}

export default SeoTagInfomation
