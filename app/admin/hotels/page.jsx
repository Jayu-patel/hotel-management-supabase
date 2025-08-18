"use client";
import Loader from "@/app/components/Loader";
import { supabase } from "@/app/utils/supabase-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ConfirmationPopup from "../../components/PopUp";
import Image from "next/image";

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize] = useState(3); // hotels per page
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  const getData = async () => {
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Fetch hotels with pagination
    const { data, error, count } = await supabase
      .from("hotels")
      .select("*", { count: "exact" })
      .range(from, to);

    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }

    setHotels(data || []);
    setTotalPages(Math.ceil((count || 0) / pageSize));
    setLoading(false);
  };

  const refetch = async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("hotels")
      .select("*", { count: "exact" })
      .range(from, to);

    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }

    setHotels(data || []);
    setTotalPages(Math.ceil((count || 0) / pageSize));
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowPopup(true);
  };

  const confirmDelete = async () => {
    const { error } = await supabase.from("hotels").delete().eq("id", deleteId);

    if (error) {
      setDeleteId(null);
      toast.error("Error while deleting hotel : ", error.message);
      return;
    }
    refetch();
    toast.success("Hotel deleted");
    setShowPopup(false);
  };

  const cancelDelete = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    refetch();
  }, [page]);

  if (loading)
    return (
      <div className="w-[100%] h-[calc(100vh-100px)] grid place-items-center">
        <Loader />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <ConfirmationPopup
        showPopup={showPopup}
        handleConfirm={confirmDelete}
        handleCancel={cancelDelete}
        header={"Are you sure"}
        message={"Are you sure you want to delete this hotel?"}
        btnMessage={"Delete"}
      />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Hotels</h1>
        <button
          onClick={() => router.push("/admin/add_hotel")}
          className="bg-[#5f6fff] hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow cursor-pointer"
        >
          Add Hotel
        </button>
      </div>

      {/* Hotels Grid */}
      {hotels.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">No hotels found.</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={hotel.image}
                    alt={hotel.name}
                    fill
                    className="w-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h2 className="text-xl font-semibold">{hotel.name}</h2>
                  <p className="text-gray-600 text-sm">{hotel.description}</p>
                  <p className="text-lg font-bold">
                    ₹{hotel.price_per_night}{" "}
                    <span className="text-gray-500 text-sm">/night</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {hotel.address}, {hotel.city}, {hotel.state},{" "}
                    {hotel.country}
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/hotels/${hotel.id}`)}
                      className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(hotel.id)}
                      className="mt-2 w-full bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-lg cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setPage(index + 1)}
                className={`px-3 py-1 rounded ${
                  page === index + 1
                    ? "bg-[#5f6fff] text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}


// "use client";
// import Loader from "@/app/components/Loader";
// import { supabase } from "@/app/utils/supabase-client";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import ConfirmationPopup from '../../components/PopUp';

// export default function Hotels() {
//   const [hotels, setHotels] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [deleteId, setDeleteId] = useState(null)
//   const [showPopup, setShowPopup] = useState(false)

//   const router = useRouter()

//   const getData=async()=>{
//       setLoading(true)
//       const {data, error} = await supabase.from("hotels").select("*")

//       if(error){
//           setLoading(false)
//           return toast.error(error.message)
//       }
//       setHotels(data)
//       setLoading(false)
//   }

//   const refetch=async()=>{
//     const {data, error} = await supabase.from("hotels").select("*")

//     if(error){
//         setLoading(false)
//         return toast.error(error.message)
//     }
//     setHotels(data)
//   }

//   const handleDelete=(id)=>{
//     setDeleteId(id)
//     setShowPopup(true)
//   }

//   const confirmDelete=async()=>{
//     const {error} = await supabase
//     .from("hotels")
//     .delete()
//     .eq("id", deleteId)

//     if(error){
//         setDeleteId(null)
//         toast.error("Error while deleting hotel : ", error.message)
//         return
//     }
//     refetch()
//     toast.success("Hotel deleted")
//     setShowPopup(false)
//   }

//   const cancelDelete=()=>{
//     setShowPopup(false)
//   }

//   useEffect(()=>{
//       getData()
//   },[])
//   if(loading) return <div className='w-[100%] h-[calc(100vh-100px)] grid place-items-center'> <Loader/> </div>

//   return (
//     <div className="max-w-7xl h-[calc(100vh-72px)] overflow-y-scroll mx-auto p-6">
//       {/* Header */}
//       <ConfirmationPopup
//           showPopup={showPopup}
//           handleConfirm={confirmDelete}
//           handleCancel={cancelDelete}
//           header={"Are you sure"}
//           message={"Are you sure you want to delete this hotel?"} 
//           btnMessage={"Delete"} 
//         />
//       <div className="flex items-center justify-between mb-8">
//         <h1 className="text-3xl font-bold">Hotels</h1>
//         <button
//           onClick={() => router.push("/admin/add_hotel")}
//           className="bg-[#5f6fff] hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow cursor-pointer"
//         >
//           Add Hotel
//         </button>
//       </div>

//       {/* Hotels Grid */}
//       {hotels.length === 0 ? (
//         <p className="text-gray-500 text-center mt-20">No hotels found.</p>
//       ) : (
//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {hotels.map((hotel) => (
//             <div
//               key={hotel.id}
//               className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
//             >
//               <img
//                 src={hotel.image}
//                 alt={hotel.name}
//                 className="h-48 w-full object-cover"
//               />
//               <div className="p-4 space-y-2">
//                 <h2 className="text-xl font-semibold">{hotel.name}</h2>
//                 <p className="text-gray-600 text-sm">{hotel.description}</p>
//                 <p className="text-lg font-bold">
//                   ₹{hotel.price_per_night}{" "}
//                   <span className="text-gray-500 text-sm">/night</span>
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   {hotel.address}, {hotel.city}, {hotel.state},{" "}
//                   {hotel.country}
//                 </p>

//                 {/* Buttons */}
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => router.push(`/admin/hotels/${hotel.id}`)}
//                     className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg cursor-pointer"
//                   >
//                     View Details
//                   </button>
//                   <button
//                     onClick={() => handleDelete(hotel.id)}
//                     className="mt-2 w-full bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-lg cursor-pointer"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
// );

// }
