import type { FieldErrors, UseFormRegister, Control } from 'react-hook-form'
import { LandingPageFormValues } from '@/utils/create-course/landingPage'

export type Props = {
  register: UseFormRegister<LandingPageFormValues>
  control: Control<LandingPageFormValues>
  errors: FieldErrors<LandingPageFormValues>
  setValue: any
  getValues: any
}
