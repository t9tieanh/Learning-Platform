'use client'
import React, { useState } from 'react'
import log from '@/assets/images/signin.png'
import register from '@/assets/images/signup.png'
import SignInForm from '@/components/SignInForm'
import SignUpForm from '@/components/SignUpForm'

interface SlidingLoginSignupProps {}

const SlidingLoginSignup: React.FC<SlidingLoginSignupProps> = () => {
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false)

  const toggleSignUpMode = () => {
    setIsSignUpMode(!isSignUpMode)
  }

  // Common button styles
  const buttonClasses = `w-full text-white bg-blue-500 hover:bg-brightColor focus:ring-4 focus:outline-none 
    focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-3 text-center transition-all 
    duration-400 transform hover:scale-[1.02] hover:shadow-md`
  const buttonForGFT = `inline-flex w-full justify-center items-center rounded-lg border border-gray-300 
    py-2.5 px-4 text-sm font-medium text-gray-500 hover:bg-gray-50 shadow-sm transition-all 
    duration-400 hover:shadow hover:border-gray-400`

  return (
    <div
      style={{ transition: 'all 6000ms ease-in-out' }}
      className={`relative w-full bg-white min-h-[100vh] lg:min-h-screen overflow-hidden
           before:content-[''] before:absolute before:w-[1500px] before:h-[1500px] lg:before:h-[2000px] 
           lg:before:w-[2000px] lg:before:top-[-10%]  before:top-[initial] lg:before:right-[48%] 
           before:right-[initial]  max-lg:before:left-[30%] max-sm:bottom-[72%]   max-md:before:left-1/2 
            max-lg:before:bottom-[75%]  before:z-[6] before:rounded-[50%]    max-md:p-6     
            lg:before:-translate-y-1/2  max-lg:before:-translate-x-1/2  before:bg-blue-400 
            before:transition-all before:duration-[6000ms] lg:before:duration-[6000ms]  ${
              isSignUpMode
                ? `lg:before:translate-x-full before:-translate-x-1/2 
          before:translate-y-full lg:before:right-[52%] before:right-[initial]  sm:max-lg:before:bottom-[22%]
           max-sm:before:bottom-[20%]  max-md:before:left-1/2`
                : ''
            }`}
    >
      <div className='absolute w-full h-full top-0 left-0'>
        <div
          className={`
            absolute
            top-[95%] lg:top-1/2 left-1/2
            grid grid-cols-1 z-[5] -translate-x-1/2 
            -translate-y-full lg:-translate-y-1/2 lg:w-1/2 w-full  transition-[1s]  duration-[1.6s] 
            lg:duration-[1.4s] ease-[ease-in-out]
            ${
              isSignUpMode
                ? 'lg:left-1/4   max-lg:top-[-10%]   max-lg:-translate-x-2/4   max-lg:translate-y-0'
                : 'lg:left-3/4 '
            }
            max-lg:static max-lg:flex max-lg:items-center max-lg:justify-center max-lg:h-full max-lg:translate-x-0 max-lg:translate-y-0
          `}
        >
          <div
            style={{ transition: 'all 1500ms ease-in-out' }}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-[6000ms] ease-in-out
  ${isSignUpMode ? 'opacity-0 -translate-x-20 pointer-events-none' : 'opacity-100 translate-x-0'}`}
          >
            <SignInForm buttonClasses={buttonClasses} buttonForGFT={buttonForGFT} />
          </div>
          <div
            style={{ transition: 'all 1500ms ease-in-out' }}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-[6000ms] ease-in-out
  ${isSignUpMode ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20 pointer-events-none'}`}
          >
            <SignUpForm buttonClasses={buttonClasses} buttonForGFT={buttonForGFT} />
          </div>
        </div>
      </div>

      <div
        className='absolute h-full w-full top-0 left-0 grid grid-cols-1   max-lg:grid-rows-[1fr_2fr_1fr]  
      lg:grid-cols-2'
      >
        <div
          className={`flex flex-row justify-center lg:flex-col items-center  
    max-lg:col-start-1 max-lg:col-end-2 max-lg:px-[8%] max-lg:py-10 
    lg:items-center text-center z-[6] max-lg:row-start-1 max-lg:row-end-2
    pt-12 pb-8 ${isSignUpMode ? 'lg:pointer-events-none' : 'lg:pointer-events-auto'}`}
        >
          <div
            style={{ transition: 'all 1500ms ease-in-out' }}
            className={`text-white items-center flex flex-col justify-center text-center transition-transform duration-[1.8s]  lg:duration-[2.2s] ease-[ease-in-out] 
               delay-[1.6s] lg:delay-[0.8s]   max-lg:pr-[15%]  max-md:px-4  max-md:py-2 ${
                 isSignUpMode ? 'lg:translate-x-[-800px]   max-lg:translate-y-[-300px]' : ''
               }`}
          >
            <h3 className='font-semibold leading-none text-[1.2rem] lg:text-[1.5rem]'>New here ?</h3>
            <p className='text-[0.7rem] lg:text-[0.95rem] px-0 py-2 lg:py-[0.7rem]'>
              Sign up and discover our platform
            </p>
            <button
              className='bg-transparent w-[110px] h-[35px] text-[0.7rem] lg:w-[130px] lg:h-[41px] 
              lg:text-[0.8rem]  font-semibold   border-2 border-white rounded-full transition-colors duration-600 
              hover:bg-white hover:text-gray-700'
              id='sign-up-btn'
              onClick={toggleSignUpMode}
            >
              Sign up
            </button>
          </div>
          <img
            style={{ transition: 'all 1500ms ease-in-out' }}
            src={log}
            className={`max-md:hidden max-lg:translate-y-[-40px] w-[200px] lg:w-full scale-90 transition-transform 
    duration-[1.8s] lg:duration-[2.2s] ease-[ease-in-out] delay-[1.2s] lg:delay-[0.8s] ${
      isSignUpMode ? 'lg:translate-x-[-800px] max-lg:translate-y-[-300px]' : ''
    }`}
            alt='login'
          />
        </div>
        <div
          className={`flex flex-row   max-lg:row-start-3 max-lg:row-end-4 lg:flex-col items-center lg:items-end 
            justify-around text-center z-[6]   max-lg:col-start-1 max-lg:col-end-2  max-lg:px-[8%]   max-lg:py-10 
             pl-[17%] pr-[12%] pt-12 pb-8 ${isSignUpMode ? 'lg:pointer-events-auto' : 'lg:pointer-events-none'}`}
        >
          <div
            style={{ transition: 'all 1500ms ease-in-out' }}
            className={`text-white transition-transform duration-[1.8s] lg:duration-[2.2s] ease-in-out delay-[1.6s]
               lg:delay-[0.8s]   max-lg:pr-[15%] max-md:px-4  max-md:py-2 ${
                 isSignUpMode ? '' : 'lg:translate-x-[800px]   max-lg:translate-y-[300px]'
               }`}
          >
            <h3 className='font-semibold leading-none text-[1.2rem] lg:text-[1.5rem]'>One of us ?</h3>
            <p className=' py-2 text-[0.7rem] lg:text-[0.95rem] px-0  lg:py-[0.7rem]'>
              Sign in to your account to have hastle free experience
            </p>
            <button
              className='bg-transparent w-[110px] h-[35px]  text-[0.7rem] lg:w-[130px] 
              lg:h-[41px] lg:text-[0.8rem]  font-semibold   border-2 border-white rounded-full 
              transition-colors duration-600 hover:bg-white hover:text-gray-700'
              id='sign-in-btn'
              onClick={toggleSignUpMode}
            >
              Sign in
            </button>
          </div>

          <img
            style={{ transition: 'all 1500ms ease-in-out' }}
            src={register}
            alt='register'
            className={`max-md:hidden w-[200px] lg:w-full transition-transform duration-[1800ms] 
    lg:duration-[2200ms] ease-in-out delay-[1200ms] lg:delay-[800ms] ${
      isSignUpMode ? '' : 'lg:translate-x-[800px] max-lg:translate-y-[300px]'
    }`}
          />
        </div>
      </div>
    </div>
  )
}

export default SlidingLoginSignup