import tagsService from '@/services/course/tags.service'
import { useEffect, useState } from 'react'

const useTags = () => {
  const [tags, setTags] = useState<
    {
      id: string
      name: string
      imageUrl: string
    }[]
  >([])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await tagsService.getAllTags()
        if (response && response.code && response.code === 200 && response.result) {
          setTags(response.result)
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      }
    }

    fetchTags()
  }, [])

  return tags
}

export default useTags
