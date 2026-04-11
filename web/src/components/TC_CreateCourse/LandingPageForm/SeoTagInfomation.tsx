import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CirclePlus } from 'lucide-react';
import { Props as CommonProps } from '@/utils/common/reactHookFormProps'
import CustomTag from '@/components/common/CustomTag'
import useTags from '@/hooks/useTags.hook'
import CustomButton from '@/components/common/Button'
import tagsService from '@/services/course/tags.service'
import useLoading from '@/hooks/useLoading.hook'
import { toast } from 'sonner';
import { cn } from '@/lib/utils'

import SeoTagInfomationSkeleton from './Skeleton/SeoTagInfomationSkeleton'

interface SeoTagInfomationProps {
  formProps: CommonProps
  id: string
}

const SeoTagInfomation = ({ formProps, id }: SeoTagInfomationProps) => {
  const { register, control, errors, setValue, getValues } = formProps
  const tags = getValues('tags') || []
  const { tags: availableTags, loading: tagsLoading } = useTags()
  const { loading, startLoading, stopLoading } = useLoading()
  const [displayLimit, setDisplayLimit] = useState(10)
  const hasMoreTags = (availableTags?.length || 0) > displayLimit

  const removeTag = (tagToRemove: { id: string; name: string }) => {
    setValue(
      'tags',
      tags.filter((tag: { id: string; name: string }) => tag.id !== tagToRemove.id)
    )
  }

  const handleAddNewTags = async () => {
    const tagIds = tags.map((tag: any) => (typeof tag === 'object' ? tag.id : tag))
    const courseId = id

    try {
      startLoading()
      const response = await tagsService.addTagsToCourse(courseId, tagIds)
      if (response?.code === 200) {
        toast.success(response?.message || 'Thêm tag thành công !')
      } else {
        toast.error(response?.message || 'Thêm tag thất bại !')
      }
    } catch (error) {
      console.log('Error adding tags')
    } finally {
      stopLoading()
    }
  }

  if (tagsLoading) {
    return <SeoTagInfomationSkeleton />
  }

  return (
    <>
      <Card className='border-2 border-white ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] overflow-hidden'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-[15px] font-bold text-gray-900'>Thẻ khóa học</CardTitle>
          <p className='text-[11.5px] font-medium text-gray-400'>Chọn tối đa 10 thẻ kỹ năng liên quan nhất đến nội dung giảng dạy.</p>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
            {
              availableTags?.slice(0, displayLimit).map((tag) => (
                <CustomTag
                  key={tag.id}
                  label={tag.name}
                  imageUri={tag.imageUrl}
                  checked={tags.some((t: any) => (typeof t === 'object' ? t.id === tag.id : t === tag.id))}
                  onChange={(checked: boolean) => {
                    if (checked) {
                      if (!tags.some((t: any) => (typeof t === 'object' ? t.id === tag.id : t === tag.id)) && tags.length < 10) {
                        setValue('tags', [...tags, tag])
                      }
                    } else {
                      removeTag(tag)
                    }
                  }}
                />
              ))
            }
          </div>

          {(hasMoreTags || displayLimit > 10) && (
            <div className='flex justify-center pt-2'>
              <button
                type='button'
                onClick={() => setDisplayLimit((prev: number) => hasMoreTags ? prev + 10 : 10)}
                className='text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest'
              >
                {hasMoreTags ? `Xem thêm (${(availableTags?.length || 0) - displayLimit} thẻ)` : 'Thu gọn'}
              </button>
            </div>
          )}

          <div className='flex items-center justify-between pt-4 border-t border-gray-50'>
            <div className='flex items-center gap-2'>
              <div className={cn(
                'w-2 h-2 rounded-full transition-colors',
                tags.length >= 10 ? 'bg-amber-400' : 'bg-blue-500'
              )} />
              <span className='text-[11px] font-bold text-gray-400'>{tags.length}/10 thẻ đã chọn</span>
            </div>
            <CustomButton
              onClick={handleAddNewTags}
              disabled={tags.length === 0}
              variant='default'
              className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-7.5 text-[10.5px] font-bold shadow-lg shadow-blue-100 transition-all active:scale-95'
              icon={<CirclePlus className='h-3.5 w-3.5' />}
              label='Lưu thay đổi'
              isLoader={loading}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default SeoTagInfomation
