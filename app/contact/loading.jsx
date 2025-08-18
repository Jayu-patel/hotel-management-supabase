import Loader from '@/app/components/Loader'
import React from 'react'

export default function loading() {
  return (
    <div className='w-[100%] h-[calc(100vh-100px)] grid place-items-center'>
        <Loader/>
    </div>
  )
}
