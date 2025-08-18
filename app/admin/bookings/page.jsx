"use client"
import Loader from "@/app/components/Loader"
import { supabase } from "@/app/utils/supabase-client"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function Booking() {
  const [booking, setBooking] = useState([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [pageSize] = useState(3)
  const [totalCount, setTotalCount] = useState(0)

  const fetchBookings = async (currentPage = 1) => {
    const from = (currentPage - 1) * pageSize
    const to = from + pageSize - 1

    const { count, error: countError } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
    if (countError) toast.error(countError.message)
    setTotalCount(count || 0)

    const { data, error } = await supabase
      .from("bookings")
      .select(
        "booking_date, check_in, check_out, guest_id: profiles(*), id, status, total_amount, room_id: rooms(room_number, room_type, hotel_id: hotels(*))"
      )
      .order("booking_date", { ascending: false })
      .range(from, to)

    if (error) {
      toast.error(error.message)
    } else {
      setBooking(data)
    }
  }

  const FirstFetch = async (currentPage = 1) => {
    setLoading(true)
    await fetchBookings(currentPage)
    setLoading(false)
  }

  const updateBookingStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) toast.error("Failed to update status")
  }

  useEffect(() => {
    FirstFetch(page)

    const channel = supabase
      .channel("booking_changes")
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "bookings" },
            (payload) => {
                fetchBookings(page)
                toast.success("New hotel room is booked")
            }
        )
        .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "bookings" },
            (payload) => {
                fetchBookings(page)
            }
        )
        .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "bookings" },
            (payload) => {
                fetchBookings(page)
                toast.success(`Booking ${payload.new.id} set to ${payload.new.status}`)
            }
        )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    fetchBookings(page)
  }, [page])

  if (loading)
    return (
      <div className="w-[100%] h-[calc(100vh-100px)] grid place-items-center">
        <Loader />
      </div>
    )

  if (!loading && booking.length == 0)
    return (
      <div className="m-5">
        <h1 className="font-medium text-2xl">No bookings yet</h1>
      </div>
    )

  const totalPages = Math.ceil(totalCount / pageSize)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="m-5">
      <h1 className="text-3xl font-semibold mb-5">Bookings</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {booking?.map((e) => (
          <div
            key={e.id}
            className="bg-white shadow-md rounded-2xl border hover:shadow-lg transition overflow-hidden"
          >
            {e.room_id.hotel_id.image && (
              <div className="relative h-40">
                <Image
                  src={e.room_id.hotel_id.image}
                  alt={e.room_id.hotel_id.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {e.room_id.hotel_id.name}, Room: {e.room_id.room_number}{" "}
                <span className="text-sm text-gray-500">
                  ({e.room_id.room_type})
                </span>
              </h2>

              <p className="text-sm text-gray-600">
                <span className="font-medium">Booking Id:</span> {e.id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Username:</span> {e.guest_id.full_name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">From:</span> {e.check_in}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">To:</span> {e.check_out}
              </p>

              <div className="mt-4">
                {
                  (e.status == "cancelled" || e.status == "confirmed") ?
                  <p className={`border text-center py-1 px-3 rounded-lg text-sm ${e.status == "confirmed" ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}>{e.status}</p> :
                  <select
                    value={e.status}
                    onChange={(ev) => updateBookingStatus(e.id, ev.target.value)}
                    className={`border py-1 px-3 rounded-lg text-sm ${
                      e.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : e.status === "cancelled"
                        ? "bg-red-100 text-red-700 border-red-300"
                        : e.status === "confirmed"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : ""
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination with Previous, Next, and numbered buttons */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          {pageNumbers.map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-4 py-2 rounded-lg ${
                page === num
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}


// "use client"
// import Loader from "@/app/components/Loader"
// import { supabase } from "@/app/utils/supabase-client"
// import { useEffect, useState } from "react"
// import { toast } from "react-toastify"

// export default function Booking() {
//   const [booking, setBooking] = useState([])
//   const [loading, setLoading] = useState(true)

//   const getBooking = async () => {
//     const { data, error } = await supabase
//       .from("bookings")
//       .select("booking_date, check_in, check_out, guest_id: profiles(*), id, status, total_amount, room_id: rooms(room_number, room_type, hotel_id: hotels(*))")
//       .order("booking_date", { ascending: false })
//     if (error) {
//       return toast.error(error.message)
//     }
//     console.log(data)
//     setBooking(data)
//   }

//   const firstFetch = async () => {
//     setLoading(true)
//     const { data, error } = await supabase
//       .from("bookings")
//       .select("booking_date, check_in, check_out, guest_id: profiles(*), id, status, total_amount, room_id: rooms(room_number, room_type, hotel_id: hotels(*))")
//       .order("booking_date", { ascending: false })
//     if (error) {
//       return toast.error(error.message)
//     }
//         console.log(data)
//     setBooking(data)
//     setLoading(false)
//   }

//   const updateBookingStatus = async (id, newStatus) => {
//     const { error } = await supabase
//       .from("bookings")
//       .update({ status: newStatus })
//       .eq("id", id)

//     if (error) {
//       toast.error("Failed to update status")
//     }
//   }

//   useEffect(() => {
//     firstFetch()

//     const channel = supabase
//       .channel("booking_changes")
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "bookings" },
//         () => {
//           getBooking()
//           toast.success("New hotel room is booked")
//         }
//       )
//       .on(
//         "postgres_changes",
//         { event: "DELETE", schema: "public", table: "bookings" },
//         () => {
//           getBooking()
//         }
//       )
//       .on(
//         "postgres_changes",
//         { event: "UPDATE", schema: "public", table: "bookings" },
//         (payload) => {
//           getBooking()
//           toast.success(`Booking ${payload.new.id} set to ${payload.new.status}`)
//         }
//       )
//       .subscribe()

//     return () => {
//       supabase.removeChannel(channel)
//     }
//   }, [])

//   if (loading)
//     return (
//       <div className="w-[100%] h-[calc(100vh-100px)] grid place-items-center">
//         <Loader />
//       </div>
//     )

//   if (!loading && booking.length == 0)
//     return (
//       <div className="m-5">
//         <h1 className="font-medium text-2xl">No bookings yet</h1>
//       </div>
//     )

//   return (
//   <div className="m-5">
//     <h1 className="text-2xl font-semibold mb-5">Bookings</h1>

//     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {booking?.map((e) => (
//         <div
//           key={e.id}
//           className="bg-white shadow-md rounded-2xl border hover:shadow-lg transition overflow-hidden"
//         >
//           {/* Hotel Image */}
//           {e.room_id.hotel_id.image && (
//             <img
//               src={e.room_id.hotel_id.image}
//               alt={e.room_id.hotel_id.name}
//               className="w-full h-40 object-cover"
//             />
//           )}

//           <div className="p-6">
//             <h2 className="text-lg font-semibold text-gray-800 mb-2">
//               {e.room_id.hotel_id.name}, Room: {e.room_id.room_number}{" "}
//               <span className="text-sm text-gray-500">({e.room_id.room_type})</span>
//             </h2>

//             <p className="text-sm text-gray-600">
//               <span className="font-medium">Booking Id:</span> {e.id}
//             </p>
//             <p className="text-sm text-gray-600">
//               <span className="font-medium">Username:</span> {e.guest_id.full_name}
//             </p>
//             <p className="text-sm text-gray-600">
//               <span className="font-medium">From:</span> {e.check_in}
//             </p>
//             <p className="text-sm text-gray-600">
//               <span className="font-medium">To:</span> {e.check_out}
//             </p>

//             <div className="mt-4">
//               <select
//                 value={e.status}
//                 onChange={(ev) => updateBookingStatus(e.id, ev.target.value)}
//                 className={`border py-1 px-3 rounded-lg text-sm ${
//                   e.status === "pending"
//                     ? "bg-yellow-100 text-yellow-700 border-yellow-300"
//                     : e.status === "cancelled"
//                     ? "bg-red-100 text-red-700 border-red-300"
//                     : e.status === "confirmed"
//                     ? "bg-green-100 text-green-700 border-green-300"
//                     : ""
//                 }`}
//               >
//                 <option value="pending">Pending</option>
//                 <option value="confirmed">Confirmed</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>
// )

// }

//*88888888888888888888888888888888888888888888888888888888888888888*****8888888888888888888888888888888888888888888888888888888888
// "use client"
// import Loader from "@/app/components/Loader"
// import { supabase } from "@/app/utils/supabase-client"
// import { useEffect, useState } from "react"
// import { toast } from "react-toastify"

// export default function Booking(){
//     const [booking, setBooking] = useState([])
//     const [loading, setLoading] = useState(true)

//     const getBooking=async()=>{
//         const {data, error} = await supabase
//             .from("bookings")
//             .select("booking_date, check_in, check_out, guest_id, id, status, total_amount, room_id: rooms(room_number, room_type, hotel_id: hotels(*))")
//             .order("booking_date", { ascending: false });
//         if(error){
//             return toast.error(error.message)
//         }
//         setBooking(data)
//     }

//     const firstFetch=async()=>{
//         setLoading(true)
//         const {data, error} = await supabase
//             .from("bookings")
//             .select("booking_date, check_in, check_out, guest_id, id, status, total_amount, room_id: rooms(room_number, room_type, hotel_id: hotels(*))")
//             .order("booking_date", { ascending: false });
//         if(error){
//             return toast.error(error.message)
//         }
//         setBooking(data)
//         setLoading(false)
//     }

//     const updateBookingStatus = async(id, newStatus)=>{
//         const { error } = await supabase
//             .from("bookings")
//             .update({ status: newStatus })
//             .eq("id", id)

//         if (error) {
//             toast.error("Failed to update status")

//         }
//     }


//     useEffect(()=>{
//         firstFetch()

//         const channel = supabase
//         .channel("booking_changes")
//         .on(
//             "postgres_changes",
//             { event: "INSERT", schema: "public", table: "bookings" },
//             (payload) => {
//                 getBooking()
//                 toast.success("New hotel room is booked")
//             }
//         )
//         .on(
//             "postgres_changes",
//             { event: "DELETE", schema: "public", table: "bookings" },
//             (payload) => {
//                 getBooking()
//             }
//         )
//         .on(
//             "postgres_changes",
//             { event: "UPDATE", schema: "public", table: "bookings" },
//             (payload) => {
//                 console.log(payload)
//                 getBooking()
//                 toast.success(`Booking ${payload.new.id} set to ${payload.new.status}`)
//             }
//         )
//         .subscribe()

//         return () => {
//             supabase.removeChannel(channel)
//         }
//     },[])

//     if(loading) return <div className='w-[100%] h-[calc(100vh-100px)] grid place-items-center'> <Loader/> </div>
//     if(!loading && booking.length == 0) return <div className="m-5">
//         <h1 className="font-medium text-2xl">No bookings yet</h1>
//     </div>
//     return(
//         <div className="m-5">
//             <h1 className="text-2xl font-semibold mb-5">Bookings</h1>

//             <div className='bg-gray-50 border rounded text-sm max-h-[80vh]'>
//                 <div className='grid grid-cols-[2fr_2fr_4fr_1fr_1fr_1fr] grid-flow-col py-3 px-6 border-b text-center'>
//                     <p>Booking Id</p>
//                     <p>UserId</p>
//                     <p>Room</p>
//                     <p>From</p>
//                     <p>To</p>
//                     <p>Status</p>
//                 </div>

//                 {
//                     booking?.map((e)=>{
//                         return (
//                           <div
//                             key={e.id}
//                             className="max-sm:gap-1 grid grid-cols-[2fr_2fr_4fr_1fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 text-center"
//                           >
//                             <p>{e.id}</p>
//                             <p>{e.guest_id}</p>
//                             <span className="flex justify-center gap-1">
//                               <p>{e.room_id.hotel_id.name},</p>
//                               <p>Room: {e.room_id.room_number}</p>
//                               <p>{e.room_id.room_type}</p>
//                             </span>
//                             <p>{e.check_in}</p>
//                             <p>{e.check_out}</p>
//                             {/* <p className={`border py-1 px-2 rounded-lg text-center ${ e.status === "pending" ? "bg-yellow-100 text-yellow-700 border-yellow-300" : e.status === "cancelled" ? "bg-red-100 text-red-700 border-red-300" : e.status === "confirmed" ? "bg-green-100 text-green-700 border-green-300" : "" }`}>
//                                     {e.status}
//                                 </p> */}
//                             <p>
//                               <select
//                                 value={e.status}
//                                 onChange={(ev) =>
//                                   updateBookingStatus(e.id,ev.target.value)
//                                 }
//                                 className={`border py-1 px-2 rounded-lg text-center ${
//                                   e.status === "pending"
//                                     ? "bg-yellow-100 text-yellow-700 border-yellow-300"
//                                     : e.status === "cancelled"
//                                     ? "bg-red-100 text-red-700 border-red-300"
//                                     : e.status === "confirmed"
//                                     ? "bg-green-100 text-green-700 border-green-300"
//                                     : ""
//                                 }`}
//                               >
//                                 <option value="pending">Pending</option>
//                                 <option value="confirmed">Confirmed</option>
//                                 <option value="cancelled">Cancelled</option>
//                               </select>
//                             </p>
//                           </div>
//                         );
//                     })
//                 }
//             </div>
//         </div>
//     )
// }