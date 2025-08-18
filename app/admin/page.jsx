"use client"
import { useContext, useEffect, useState } from 'react'
import Loader from '../components/Loader'
import { BookText, Hotel, Users } from 'lucide-react'
import { supabase } from '../utils/supabase-client'

export default function Admin() {
    const [hotelCount, setHotelCount] = useState(0)
    const [bookingCount, setBookingCount] = useState(0)
    const [roomCount, setRoomCount] = useState(0)
    const [loading, setLoading] = useState(true)
    
    useEffect(()=>{
        let isMounted = true
        const fetchData=async()=>{
            setLoading(true)
            const { count: hotelsCount } = await supabase.from('hotels').select('*', { count: 'exact', head: true })
            setHotelCount(hotelsCount)

            const { count: roomsCount } = await supabase.from('rooms').select('*', { count: 'exact', head: true })
            setRoomCount(roomsCount)

            const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true })
            setBookingCount(bookingCount)
            setLoading(false)
        }
        if(isMounted) fetchData();

        return () => {
            isMounted = false   // cleanup
        }
    },[])

    if(loading) return <div className='w-[100%] h-[calc(100vh-100px)] grid place-items-center'> <Loader/> </div>
    return (
        <div className='m-5'>
            <div className='flex flex-wrap gap-3'>

            <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                <div className='flex-1'>
                <Hotel size={40} color="#5f6fff" />
                </div>
                <div className='flex-2'>
                <p className='text-xl font-semibold text-gray-600'>{hotelCount}</p>
                <p className='text-gray-400'>Hotels</p>
                </div>
            </div>

            <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                <div className='flex-1'>
                <BookText size={40} color="#5f6fff" />
                </div>
                <div className='flex-2'>
                <p className='text-xl font-semibold text-gray-600'>{bookingCount}</p>
                <p className='text-gray-400'>Bookings</p>
                </div>
            </div>

            <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
                <div className='flex-1'>
                <Users size={40} color="#5f6fff" />
                </div>
                <div className='flex-2'>
                <p className='text-xl font-semibold text-gray-600'>{roomCount}</p>
                <p className='text-gray-400'>Rooms</p>
                </div>
            </div>

            </div>

            {/* <div className='bg-white'>

            <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
                <img src={"/list_icon.svg"} alt="" />
                <p className='font-semibold'>Latest Bookings</p>
            </div>

            <div className='pt-4 border border-t-0'>
                {
                dashData?.latestAppointments?.map((item,index)=>(
                    <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
                    <img className='rounded-full w-10' src={item?.docId?.image} alt="" />
                    <div className='flex-1 text-sm'>
                        <p className='text-gray-800 font-medium'>{item?.docId?.name}</p>
                        <p className='text-gray-600'>{slotDateFormat(item?.slotDate)}</p>
                    </div>
                    {
                        item?.cancelled ? 
                        <p className='text-red-400 text-xs font-medium'>Cancelled</p> :
                        item.isCompleted ? 
                        <p className='text-green-400 text-xs font-medium'>Completed</p> :
                        <img onClick={()=>{cancelAppointment(item?._id)}} src="/cancel_icon.svg" alt="X"  className='cursor-pointer'/>
                    }
                    </div>
                ))
                }
            </div>

            </div> */}

        </div>
    )
}