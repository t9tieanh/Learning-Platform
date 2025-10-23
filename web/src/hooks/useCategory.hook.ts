import { useEffect, useState } from 'react'
import categoryService from '@/services/course/category.service'

const useCategory = () => {
  const [categories, setCategories] = useState<{ id: string; name: string; description: string }[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories()
        if (response && response.code && response.code === 200 && response.result) {
          setCategories(response.result)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [])

  return categories
}

export default useCategory
