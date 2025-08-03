import { FC, useState } from 'react'
import reactlogo from './assets/images/react.svg'
import './assets/styles/app.css'
import './assets/styles/app.scss'

const App: FC = () => {
  const [fullname] = useState('Phạm Tiến Anh')
  return (
    <div>
      <img src={reactlogo} alt='React Logo' width={100} height={100} />
      <h1 className='font-bold text-2xl underline text-red-700'>{fullname}</h1>
      <h2>Bắt đầu thôi, web bạn đang chạy trên ... {process.env.HOST}</h2>
    </div>
  )
}

export default App
