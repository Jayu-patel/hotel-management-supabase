"use client"
import { useContext, useEffect, useState } from "react"
import { supabase } from "../utils/supabase-client"
import { AuthContext } from "../contexts/AuthContext"
import { toast } from "react-toastify"
import Loader from "../components/Loader"

export default function Bookings(){
    const {session} = useContext(AuthContext)
    const [bookings, setBookings] = useState([])
    const [tempStatus, setTempStatus] = useState("pending")
    const [loading, setLoading] = useState(true)

    const fetchData=async()=>{
      const {data, error} = await supabase
          .from("bookings")
          .select("booking_date, check_in, check_out, guest_id, id, status, total_amount, room_id: rooms(room_number, room_type, hotel_id: hotels(*))")
          .eq("guest_id", session?.user?.id)
          .order("booking_date", { ascending: false });
      if(error){
          setLoading(false)
          return toast.error(error.message)
      }
      setBookings(data)
    }

    const getMyBookings=async()=>{
      setLoading(true)
      await fetchData()
      setLoading(false)
    }

    const changeStatus=async(id, newStatus)=>{
        const {error} = await supabase
            .from("bookings")
            .update({status: newStatus})
            .single()
            .eq("id", id)
        
        if(error){
            toast.error(error.message)
            return
        }
        setTempStatus("pending")
    }

    function capitalizeFirstLetter(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    useEffect(()=>{
        if(session){
          getMyBookings()
        }
    },[session])

    useEffect(()=>{
        const channel = supabase
        .channel("booking_changes")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "bookings" },
            (payload) => {
                fetchData()
            }
        )
        .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "bookings" },
            (payload) => {
                toast.success(`Booking ${payload.new.id} set to ${payload.new.status}`)
            }
        )
        .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    },[])

    if(loading) return <div className='w-[100%] h-[calc(100vh-100px)] grid place-items-center'> <Loader/> </div>
    if(!loading && bookings.length == 0) return <div className="p-5"><h1 className="font-semibold text-2xl">You don't have any bookings yet.</h1></div>
    return (
      bookings && (
        // <div className="m-5">
        //     <h1 className="text-2xl font-medium">My Bookings</h1>

        //     <div className="w-full md:w-[50%] h-[100vh] mt-4 flex flex-col gap-5">
        //         {
        //             bookings?.map((e)=>{
        //                 return(
        //                     <div key={e._id} className="w-[90%] flex flex-col gap-1 mx-auto shadow-xl border border-gray-200 p-4">
        //                         <span className="flex gap-1 text-xl font-medium">
        //                             <p>{e.room_id.hotel_id.name},</p>
        //                             <p>Room: {e.room_id.room_number}</p>
        //                             <p>- {e.room_id.room_type}</p>
        //                         </span>
        //                         <p>Booking Id : {e.id}</p>
        //                         <p>Check In : {e.check_in}</p>
        //                         <p>Check Out : {e.check_out}</p>
        //                         <p>Amount : {e.total_amount}</p>
        //                         <div className="mt-1">
        //                             <p className={`border py-1 px-2 rounded-lg text-center ${ e.status === "pending" ? "bg-yellow-100 text-yellow-700 border-yellow-300" : e.status === "cancelled" ? "bg-red-100 text-red-700 border-red-300" : e.status === "confirmed" ? "bg-green-100 text-green-700 border-green-300" : "" }`}>
        //                                 {capitalizeFirstLetter(e.status)}
        //                             </p>
        //                         </div>
        //                     </div>
        //                 )
        //             })
        //         }
        //     </div>
        // </div>
        <div className="m-5">
          <h1 className="text-2xl font-medium">My Bookings</h1>

          <div className="w-full md:w-[50%] h-[100vh] mt-4 flex flex-col gap-5">
            {bookings?.map((e) => {
              return (
                <div
                  key={e.id}
                  className="w-[90%] flex flex-col gap-1 mx-auto border shadow-2xs border-gray-500 p-4 rounded-xl"
                >
                  <span className="flex gap-1 text-xl font-medium">
                    <p>{e.room_id.hotel_id.name},</p>
                    <p>Room: {e.room_id.room_number}</p>
                    <p>- {e.room_id.room_type}</p>
                  </span>
                  <p>Booking Id : {e.id}</p>
                  <p>Check In : {e.check_in}</p>
                  <p>Check Out : {e.check_out}</p>
                  <p>Amount : {e.total_amount}</p>

                  <div className="mt-1">
                    <p
                      className={`border py-1 px-2 rounded-lg text-center ${
                        e.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                          : e.status === "cancelled"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : e.status === "confirmed"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : ""
                      }`}
                    >
                      {capitalizeFirstLetter(e.status)}
                    </p>
                  </div>

                  {
                    (e.status == "cancelled" || e.status == "confirmed") ?
                    <></> :
                    <div className="flex items-center gap-3 mt-2">
                      <select
                        className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        defaultValue={e.status}
                        onChange={(event) => {setTempStatus(event.target.value)}}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        className="bg-[#5f6fff] text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-all cursor-pointer"
                        onClick={() => {changeStatus(e.id, tempStatus)}}
                      >
                        Update
                      </button>
                    </div> 
                  } 
                </div>
              );
            })}
          </div>
        </div>
      )
    );
}