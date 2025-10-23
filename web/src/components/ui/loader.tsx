import { Loader2 } from 'lucide-react'

export const Loader = () => {
    return (
        <div className='flex items-center justify-center py-8'>
            <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
        </div>
    )
}
