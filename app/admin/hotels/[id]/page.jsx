"use client";
import Loader from "@/app/components/Loader";
import { supabase } from "@/app/utils/supabase-client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function HotelDetailsPage({ params }) {
  const { id } = React.use(params);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);

  const [hotel, setHotel] = useState({
    image: "/hotel-sample.jpg",
    name: "Grand Palace Hotel",
    description:
      "A luxurious hotel offering stunning views, world-class amenities, and exceptional service.",
    price_per_night: 250,
    address: "123 Luxury St",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
  });
  const [rooms, setRooms] = useState([
    {
      id: 1,
      room_type: "Standard",
      capacity: 2,
      price_per_night: 100,
      room_number: "101",
    },
  ]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [savingHotel, setSavingHotel] = useState(false);

  const [showRoomPopup, setShowRoomPopup] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(e.target.files[0]);
    console.log(e.target.files[0]);
    if (file) {
      setHotel({ ...hotel, image: URL.createObjectURL(file) });
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    setSavingHotel(true);
    let imageUrl = hotel.image;

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("hotels")
        .upload(fileName, image);

      if (uploadError) {
        setSavingHotel(false);
        toast.error(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("hotels").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("hotels")
      .update({ ...hotel, image: imageUrl })
      .eq("id", id);

    if (error) {
      setSavingHotel(false);
      toast.error(error.message);
      return;
    }

    toast.success("Hotel updated!")

    setEditMode(false);
    setSavingHotel(false);
  };

  const handleAddRoom = async (room) => {
    setRoomLoading(true);
    const { error } = await supabase
      .from("rooms")
      .insert({ ...room, hotel_id: id })
      .single();

    if (error) {
      setRoomLoading(false);
      return toast.error(error.message);
    }
    toast.success("New room added!")
    setShowRoomPopup(false);
    setRoomLoading(false);
    getRooms();
  };

  const getData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }

    setHotel((prev) => ({
      ...prev,
      image: data.image,
      name: data.name,
      description: data.description,
      price_per_night: data.price_per_night,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
    }));
    setLoading(false);
  };

  const getRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("hotel_id", id)
      .order("room_number", {ascending: true})
    if (error) {
      return toast.error(error.message);
    }
    setRooms(data);
  };

  useEffect(() => {
    getData();
    getRooms();
  }, []);

  if (loading)
    return (
      <div className="w-[100%] h-[calc(100vh-100px)] grid place-items-center">
        {" "}
        <Loader />{" "}
      </div>
    );
  return (
    <div className="max-w-5xl mx-auto p-6 [&_button]:cursor-pointer">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex gap-6 items-start">
          <div className="relative group">
            <img
              src={hotel.image}
              alt="Hotel"
              className="w-56 h-56 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-80"
              onClick={() => {
                if (editMode)
                  document.getElementById("hotelImageInput").click();
              }}
            />
            <input
              id="hotelImageInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div className="flex-1">
            {!editMode ? (
              <>
                <h1 className="text-2xl font-bold mb-2">{hotel.name}</h1>
                <p className="text-gray-600 mb-4">{hotel.description}</p>
                <p className="text-lg font-semibold text-green-700 mb-2">
                  ₹{hotel.price_per_night} / night
                </p>
                <p className="text-gray-500">
                  {hotel.address}, {hotel.city}, {hotel.state}, {hotel.country}
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={hotel.name}
                  onChange={(e) => setHotel({ ...hotel, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
                <textarea
                  value={hotel.description}
                  onChange={(e) =>
                    setHotel({ ...hotel, description: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  type="number"
                  value={hotel.price_per_night}
                  onChange={(e) =>
                    setHotel({
                      ...hotel,
                      price_per_night: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  type="text"
                  value={hotel.address}
                  onChange={(e) =>
                    setHotel({ ...hotel, address: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={hotel.city}
                    onChange={(e) =>
                      setHotel({ ...hotel, city: e.target.value })
                    }
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    value={hotel.state}
                    onChange={(e) =>
                      setHotel({ ...hotel, state: e.target.value })
                    }
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    value={hotel.country}
                    onChange={(e) =>
                      setHotel({ ...hotel, country: e.target.value })
                    }
                    className="border rounded px-3 py-2"
                  />
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              {!editMode ? (
                <>
                  <button
                    onClick={handleEditToggle}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowRoomPopup(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Add Room
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    {savingHotel ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={handleEditToggle}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Room List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Rooms</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Room Number</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Capacity</th>
              <th className="p-3 border">Price/Night</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{room.room_number}</td>
                  <td className="p-3 border">{room.room_type}</td>
                  <td className="p-3 border">{room.capacity}</td>
                  <td className="p-3 border">₹{room.price_per_night}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="p-3 border text-center text-gray-500"
                >
                  No rooms available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Room Popup */}
      {showRoomPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Room</h2>
            <RoomForm
              onCancel={() => setShowRoomPopup(false)}
              onSave={handleAddRoom}
              loading={roomLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RoomForm({ onCancel, onSave, loading }) {
  const [form, setForm] = useState({
    room_type: "Standard",
    capacity: "",
    price_per_night: "",
    room_number: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={form.room_type}
        onChange={(e) => setForm({ ...form, room_type: e.target.value })}
        className="w-full border rounded px-3 py-2"
      >
        <option>Standard</option>
        <option>Deluxe</option>
        <option>Presidential</option>
      </select>
      <input
        type="number"
        placeholder="Capacity"
        value={form.capacity}
        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="number"
        placeholder="Price per Night"
        value={form.price_per_night}
        onChange={(e) => setForm({ ...form, price_per_night: e.target.value })}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="text"
        placeholder="Room Number"
        value={form.room_number}
        onChange={(e) => setForm({ ...form, room_number: e.target.value })}
        className="w-full border rounded px-3 py-2"
      />
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
