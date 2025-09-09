import * as yup from 'yup'

export type SignUpFormInputs = {
  name: string
  phone: string
  username: string
  password: string
  confirmPassword: string
  confirmRules: boolean
  email: string
}

export const signUpSchema = yup.object({
  name: yup.string().required('Tên không được để trống'),
  phone: yup
    .string()
    .required('Số điện thoại không được để trống')
    .matches(/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ'),
  username: yup.string().required('Username không được để trống'),
  password: yup.string().required('Mật khẩu không được để trống').min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp')
    .required('Xác nhận mật khẩu không được để trống'),
  confirmRules: yup.boolean().oneOf([true], 'Bạn phải đồng ý với điều khoản').default(false),
  email: yup.string().required('Email không được để trống').email('Email không hợp lệ')
})