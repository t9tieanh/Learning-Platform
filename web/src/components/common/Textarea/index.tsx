import React from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  displayLabel?: string
  required?: boolean
  error?: string | boolean
}

/**
 * Usage:
 * 1) Uncontrolled with register:
 *    <CustomTextarea displayLabel="Mô tả" placeholder="..." {...register('description')} />
 *
 * 2) Controlled with RHF Controller:
 *    <Controller name="description" control={control} render={({ field }) => (
 *      <CustomTextarea displayLabel="Mô tả" value={field.value} onChange={e => field.onChange(e.target.value)} />
 *    )} />
 */
const CustomTextarea = React.forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ displayLabel, required = false, error, className = '', rows = 4, ...rest }, ref) => {
    // If consumer passed onChange expecting value string (common with Controller),
    // preserve original event behavior but call onChange with event or value.
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // call user's onChange if provided (keeps compatibility with Controller.field.onChange expecting value or event)
      if (typeof rest.onChange === 'function') {
        // try to emulate both patterns: some handlers expect event, some expect value
        try {
          // prefer passing event (most HTML handlers)
          ;(rest.onChange as any)(e)
        } catch {
          ;(rest.onChange as any)(e.target.value)
        }
      }
    }

    return (
      <div className={`flex flex-col space-y-1 ${className}`}>
        {displayLabel && (
          <Label className='text-sm font-medium text-gray-700'>
            {displayLabel}
            {required && <span className='text-red-500 ml-1'>*</span>}
          </Label>
        )}

        <Textarea className={`h-full ${className}`} ref={ref} rows={rows} {...rest} onChange={handleChange} />

        {error && (
          <p className='text-xs text-red-500 mt-1'>{typeof error === 'string' ? error : 'Trường này không hợp lệ'}</p>
        )}
      </div>
    )
  }
)

CustomTextarea.displayName = 'CustomTextarea'
export default CustomTextarea
