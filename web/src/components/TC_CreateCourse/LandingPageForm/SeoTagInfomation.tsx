/* eslint-disable prettier/prettier */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CirclePlus } from 'lucide-react';
import { Props as CommonProps } from '@/utils/common/reactHookFormProps'
import CustomTag from '@/components/common/CustomTag'
import useTags from '@/hooks/useTags.hook'
import CustomButton from '@/components/common/Button'
import tagsService from '@/services/course/tags.service'
import useLoading from '@/hooks/useLoading.hook'
import { toast } from 'react-toastify';

interface SeoTagInfomationProps {
  formProps: CommonProps
  id: string
}

const SeoTagInfomation = ({ formProps, id }: SeoTagInfomationProps) => {
  const { register, control, errors, setValue, getValues } = formProps
  const tags = getValues('tags') || []
  const availableTags = useTags()
  const { loading, startLoading, stopLoading } = useLoading()

  const removeTag = (tagToRemove: { id: string; name: string }) => {
    setValue(
      'tags',
      tags.filter((tag: { id: string; name: string }) => tag.id !== tagToRemove.id)
    )
  }

  const handleAddNewTags = async() => {
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

  return (
    <>
      <Card className='border border-blue-200 shadow-md bg-blue-50'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold text-blue-900'>Thẻ khóa học</CardTitle>
          <p className='text-sm text-blue-700'>Thêm thẻ liên quan đến kỹ năng được dạy trong khóa.</p>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Tags list */}
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4'>
    {
      availableTags?.map((tag) => (
        <CustomTag
          key={tag.id}
          label={tag.name}
          imageUri={tag.imageUrl}
          checked={tags.some((t: any) => (typeof t === 'object' ? t.id === tag.id : t === tag.id))}
          onChange={(checked: boolean) => {
            if (checked) {
              // Add tag object (not just id)
              if (!tags.some((t: any) => (typeof t === 'object' ? t.id === tag.id : t === tag.id)) && tags.length < 10) {
                setValue('tags', [...tags, tag]) // Lưu cả object tag
              }
            } else {
              // Remove tag by id
              removeTag(tag)
            }
          }}
        />
      ))
    }
  </div>

          <div className='flex justify-end'>
            <CustomButton
              onClick={handleAddNewTags}
              disabled={tags.length >= 10}
              className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'
              icon={<CirclePlus className='h-5 w-5' />}
              label='Thêm thẻ mới'
              isLoader={loading}
            />
          </div>

          {/* Counter */}
          <div className='text-xs text-blue-600'>{tags.length}/10 thẻ đã dùng</div>
        </CardContent>
      </Card>
    </>
  )
}

export default SeoTagInfomation
