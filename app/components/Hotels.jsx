"use client"
import { toast } from 'react-toastify'
import {supabase} from '../utils/supabase-client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '../components/Loader'
import Image from 'next/image'

export default function hotels(){
    const [hotels, setHotels] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const getData=async()=>{
        setLoading(true)
        const {data, error} = await supabase.from("hotels").select("id, name, image, rating, description, city, state").order("created_at", {ascending: false})

        if(error){
            setLoading(false)
            return toast.error(error.message)
        }
        setHotels(data)
        console.log(data)
        setLoading(false)
    }

    const getHotelData=async()=>{
        const {data, error} = await supabase.from("hotels").select("id, name, image, rating, description, city, state").order("created_at", {ascending: false})

        if(error){
            setLoading(false)
            return toast.error(error.message)
        }
        setHotels(data)
    }

    useEffect(()=>{
        getData()

        const channel = supabase.channel("hotel-update")
        .on(
            "postgres_changes",
            {event: "*", schema: "public", table: "hotels"},
            (payload)=>{
                getHotelData()
            }
        )
        .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    },[])
    if(loading) return <div className='w-[100%] h-[calc(100vh-100px)] grid place-items-center'> <Loader/> </div>
    if(!loading && hotels.length == 0) return <div className='w-screen'>
        <p className="text-gray-500 text-center mt-10">No hotels found.</p>
    </div>
    return(
        <div className='w-[100vw]'>
            <div className='grid grid-cols-1 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr_1fr] w-[80%] mx-auto gap-8 my-10'>
                {
                    hotels?.map((e,i)=>{
                        return (
                            <div onClick={()=>{router.push(`/hotel/${e.id}`)}} key={e.id} className='h-[450px] bg-gray-100 rounded-sm shadow-xl cursor-pointer'>
                                <div className='h-[50%] relative'>
                                    {/* <img src={e.image} className='h-full w-full object-cover rounded-t-sm' /> */}
                                    <Image
                                        src={e.image}
                                        alt={e.name}
                                        fill
                                        className='object-cover rounded-t-sm'
                                        priority={i === 0} // Optional: Prioritize first image for LCP
                                    />
                                </div>
                                <div className='p-4'>
                                    <h1 className='font-semibold text-2xl text-[#5f6fff]'>{e.name}</h1>
                                    <h2 className='font-medium'>{e.city}, {e.state}</h2>
                                    <p className='text-sm text-gray-600'>{e.description}</p>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}