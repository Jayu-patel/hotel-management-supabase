"use client"
import { MapPin } from "lucide-react"
import React, { useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Loader from "@/app/components/Loader"
import { AuthContext } from "@/app/contexts/AuthContext"
import { useRouter } from "next/navigation"
import {supabase} from "../../utils/supabase-client"
import Image from "next/image";

export default function page({params}){
    const {id} = React.use(params)
    const {session} = useContext(AuthContext)
    const router = useRouter()
    const [hotel, setHotel] = useState(null)
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(false)


    // const [guests, setGuests] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false)
    const [roomNumber, setRoomNumber] = useState(rooms[0]?.id || 1)
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection"
        }
    ]);

    const toUTC = (date) => {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    };

    const handleBooking =async()=>{
        if(!session){
            toast.warn("login to book your hotel room!");
            return router.push("/login")
        }

        const { startDate, endDate } = dateRange[0];

        const  isSame = ( startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth() && startDate.getDate() === endDate.getDate() )

        if(isSame || startDate > endDate){
            return toast.error("Please select valid dates")
        }

        const { data: room, error: roomError } = await supabase
            .from("rooms")
            .select("is_available, price_per_night")
            .eq("id", roomNumber)
            .single()
        
        if(roomError){
            return toast.error("oooo", roomError.message)
        }
        
        if (!room.is_available) {
            return toast.error("This room is currently unavailable")
        }

        const room_price = room?.price_per_night
        const days = ((dateRange[0].endDate - dateRange[0].startDate)/86400000) + 1
        const total = days * room_price

        setBookingLoading(true)
        const {error} = await supabase
            .from("bookings")
            .insert({
                guest_id: session.user.id,
                room_id: roomNumber,
                check_in: toUTC(dateRange[0].startDate),
                check_out: toUTC(dateRange[0].endDate),
                total_amount: total
            })
            .single()
        
        if(error){
            setBookingLoading(false)
            return toast.error(error.message)
        }
        
        const { error: updateError } = await supabase
            .from("rooms")
            .update({ is_available: false })
            .eq("id", roomNumber)

        if (updateError) {
            setBookingLoading(false)
            return toast.error(updateError.message)
        }
        setDateRange([
            {
                startDate: new Date(),
                endDate: new Date(),
                key: "selection"
            }
        ])

        router.push("/")
        toast.success("Booked successfully!")

        getRooms()
        setBookingLoading(false)
    };

    const getData=async()=>{
        setLoading(true)
        const {data, error} = await supabase.from("hotels").select("*").eq("id", id)

        if(error){
            setLoading(false)
            return toast.error(error.message)
        }
        setHotel(data[0])
        setLoading(false)
    }

    const getRooms=async()=>{
        const {data, error} = await supabase.from("rooms").select("*").eq("hotel_id", id).order("room_number", {ascending: true})
        if(error){
            return toast.error(error.message)
        }
        setRooms(data)
        setRoomNumber(data[0]?.id)
    }

    useEffect(()=>{
        getData()
        getRooms()

        const channel = supabase.channel("hotel-update")
        .on(
            "postgres_changes",
            {event: "*", schema: "public", table: "rooms"},
            (payload)=>{
                getRooms()
            }
        )
        .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    },[])
    if(loading) return <div className='w-[100%] h-[calc(100vh-100px)] grid place-items-center'> <Loader/> </div>
    return hotel && (
        <div className="w-[80%] mx-auto">
            <div className="w-full my-5">
                <h1 className="font-semibold text-3xl">{hotel.name}, {hotel.city}</h1>
                <p className="flex gap-2 items-center text-sm text-gray-600 ml-1">
                    <MapPin size={20} />
                    <span>{hotel.address}</span>
                </p>

                <div className="w-full md:w-[50%] my-3 relative" style={{ aspectRatio: '4/3' }}>
                    {/* <img className="rounded-2xl" src={hotel.image} alt="" /> */}
                    <Image
                        src={hotel.image}
                        alt={hotel.name}
                        fill
                        className='object-cover rounded-2xl'
                    />
                </div>

                <h2 className="font-semibold text-lg">About this property</h2>
                <p className="w-full md:w-[60%] text-sm">{hotel.description}</p>

                {
                    rooms.length != 0 ?
                    <div className="py-6 max-w-lg space-y-4">
                        <h1 className="text-xl font-bold">Book a Room</h1>
                    
                        <select
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            className="border p-2 w-full"
                        >
                            <option value="" disabled>Select room</option>
                            {
                                rooms?.map(room => {
                                    const available = room.is_available

                                    return (
                                        <option
                                            key={room.id}
                                            value={room.id}
                                            disabled={!available}
                                        >
                                            Room: {room.room_number} {!available && " (Unavailable)"}
                                        </option>
                                    )
                                })
                            }
                        </select>
                    
                        {/* Date Picker */}
                        <DateRange
                            editableDateInputs={true}
                            onChange={(item) => setDateRange([item.selection])}
                            moveRangeOnFirstSelection={false}
                            ranges={dateRange}
                            minDate={new Date()}
                        />
                    
                        {/* Book Button */}
                        <button
                            onClick={handleBooking}
                            className={`${bookingLoading ? "bg-[#2b40ff]" : "bg-[#5f6fff]"} text-white px-4 py-2 rounded w-full cursor-pointer hover:bg-[#2b40ff]`}
                            >
                                {
                                    bookingLoading ? "Booking..." : "Book Now"
                                }
                        </button>
                    </div>
                    : 
                    <div>
                        <h1 className="text-xl font-bold mt-3">No Room Available</h1>
                    </div>
                }
            </div>
        </div>
    )
}