import React, { FC } from 'react'

interface SignUpFormProps {
  buttonClasses: string
  buttonForGFT: string
}

const SignUpForm: FC<SignUpFormProps> = ({ buttonClasses, buttonForGFT }) => {
  return (
    <div className='w-full bg-white rounded-lg shadow-xl md:mt-0 sm:max-w-md xl:p-0 border border-gray-100'>
      <div className='p-6 space-y-6 md:space-y-7 sm:p-8'>
        <h1 className='text-xl font-bold leading-tight tracking-tight text-backgroundColor md:text-2xl text-center'>
          Create Account
          <p className='text-sm font-normal text-gray-500 mt-1'>Sign up to get started</p>
        </h1>

        <form className='space-y-5 md:space-y-6' action='#'>
          <div className='grid grid-cols-2 lg:grid-cols-1 gap-5 md:gap-6'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                <svg
                  className='w-5 h-5 text-gray-500'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                    clipRule='evenodd'
                  ></path>
                </svg>
              </div>
              <input
                type='text'
                name='fullName'
                id='fullName'
                className='bg-blue-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-brightColor focus:border-brightColor block w-full pl-10 p-3 transition-all duration-200 shadow-sm'
                placeholder='Full name'
                required
              />
            </div>

            <div className='relative'>
              <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                <svg
                  className='w-5 h-5 text-gray-500'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z'></path>
                  <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z'></path>
                </svg>
              </div>
              <input
                type='email'
                name='email'
                id='email'
                className='bg-blue-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-brightColor focus:border-brightColor block w-full pl-10 p-3 transition-all duration-200 shadow-sm'
                placeholder='Email address'
                required
              />
            </div>

            <div className='relative'>
              <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                <svg
                  className='w-5 h-5 text-gray-500'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                    clipRule='evenodd'
                  ></path>
                </svg>
              </div>
              <input
                type='password'
                name='password'
                id='password'
                className='bg-blue-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-brightColor focus:border-brightColor block w-full pl-10 p-3 transition-all duration-200 shadow-sm'
                placeholder='Password'
                required
              />
            </div>

            <div className='relative'>
              <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                <svg
                  className='w-5 h-5 text-gray-500'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                    clipRule='evenodd'
                  ></path>
                </svg>
              </div>
              <input
                type='password'
                name='confirmPassword'
                id='confirmPassword'
                className='bg-blue-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-brightColor focus:border-brightColor block w-full pl-10 p-3 transition-all duration-200 shadow-sm'
                placeholder='Confirm password'
                required
              />
            </div>
          </div>

          <div className='flex items-start'>
            <div className='flex items-center h-5'>
              <input
                id='terms'
                aria-describedby='terms'
                type='checkbox'
                className='w-4 h-4  rounded bg-gray-50 '
                required
              />
            </div>
            <div className='ml-3 text-sm'>
              <label htmlFor='terms' className='text-gray-500 hover:text-gray-700 cursor-pointer'>
                I agree to the{' '}
                <a href='#' className='text-brightColor hover:text-brightColor font-medium'>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href='#' className='text-brightColor hover:text-brightColor font-medium'>
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          <button type='submit' className={buttonClasses}>
            Create Account
          </button>
        </form>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-500'>Or sign up with</span>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-3'>
          {/* Google */}
          <button type='button' className={`${buttonForGFT} bg-white border border-gray-300 hover:bg-gray-100`}>
            <svg className='h-5 w-5' aria-hidden='true' viewBox='0 0 48 48'>
              <path
                fill='#EA4335'
                d='M24 9.5c3.94 0 6.6 1.7 8.1 3.1l5.9-5.9C34.3 3.1 29.6 1 24 1 14.6 1 6.7 6.6 3.3 14.6l6.9 5.4C11.7 13.2 17.3 9.5 24 9.5z'
              />
              <path
                fill='#4285F4'
                d='M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8h12.9c-.5 2.9-2.1 5.3-4.6 6.9l7.1 5.5C43.5 37.1 46.5 31.4 46.5 24.5z'
              />
              <path
                fill='#FBBC05'
                d='M10.2 28.6c-.5-1.3-.8-2.6-.8-4.1s.3-2.8.8-4.1l-6.9-5.4C1.2 18.1 0 21 0 24.5s1.2 6.4 3.3 9.5l6.9-5.4z'
              />
              <path
                fill='#34A853'
                d='M24 48c6.5 0 12-2.1 16-5.8l-7.1-5.5c-2 1.3-4.6 2.1-8.9 2.1-6.7 0-12.4-4.5-14.4-10.6l-6.9 5.4C6.7 41.4 14.6 48 24 48z'
              />
            </svg>
          </button>

          {/* Facebook */}
          <button type='button' className={`${buttonForGFT} bg-[#1877F2] hover:bg-[#0d65d9]`}>
            <svg className='h-5 w-5 text-white' aria-hidden='true' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 5 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 17 22 12z'
              />
            </svg>
          </button>

          {/* GitHub */}
          <button type='button' className={`${buttonForGFT} bg-black hover:bg-gray-800`}>
            <svg className='h-5 w-5 text-white' aria-hidden='true' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.107-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.311.469-2.382 1.236-3.221-.123-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.51 11.51 0 013.003-.404c1.018.005 2.042.138 3.003.404 2.292-1.552 3.298-1.23 3.298-1.23.655 1.653.242 2.873.119 3.176.77.839 1.235 1.91 1.235 3.221 0 4.61-2.804 5.624-5.475 5.921.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
              />
            </svg>
          </button>
        </div>

        <p className='text-sm text-center text-gray-600 mt-4 border-t border-gray-100 pt-4'>
          Already have an account? Sign in
        </p>
      </div>
    </div>
  )
}

export default SignUpForm
