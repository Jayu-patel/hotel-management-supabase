"use client";
import { useState } from "react";
import { supabase } from "../../utils/supabase-client";
import { toast } from "react-toastify";
import Loader from "@/app/components/Loader";
import { Country, State, City } from "country-state-city";
import { useRouter } from "next/navigation";

export default function AddHotelPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "",
    image: null,
    // internal helpers for selects (not saved to DB)
    countryCode: "",
    stateCode: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageLoad, setImageLoad] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);

  const router = useRouter()

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      if (file) {
        setPreview(URL.createObjectURL(file));
        setErrors((prev) => ({ ...prev, image: "" }));
      } else {
        setPreview(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Hotel name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.image) newErrors.image = "Hotel image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      let imageUrl = null;

      if (formData.image) {
        setImageLoad(true);
        const fileName = `${Date.now()}-${formData.image.name}`;
        const { error: uploadError } = await supabase.storage
          .from("hotels")
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = await supabase.storage
          .from("hotels")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
        setImageLoad(false);
      }

      const { error: insertError } = await supabase.from("hotels").insert({
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,       // name
        state: formData.state,     // name
        country: formData.country, // name
        image: imageUrl,
      });

      if (insertError) {
        return toast.error(insertError.message || "Error inserting hotel");
      }

      setMessage("✅ Hotel added successfully!");
      toast.success("Hotel added successfully!");
      router.push("/admin/hotels")
      setFormData({
        name: "",
        description: "",
        address: "",
        city: "",
        state: "",
        country: "",
        image: null,
        countryCode: "",
        stateCode: "",
      });
      setPreview(null);
      setErrors({});
    } catch (error) {
      toast.error(error.message);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (imageLoad)
    return (
      <div className="w-[100%] h-[calc(100vh-100px)] grid place-items-center">
        <Loader />
      </div>
    );

  return (
    <div className="w-full h-[calc(100vh-100px)] overflow-y-scroll">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          🏨 Add New Hotel
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
        >
          {/* Name */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Hotel Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter hotel name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="border border-gray-300 w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Write a short description..."
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>


          {/* Address */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border border-gray-300 w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Street, Area"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* Country, State, City */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Country */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Country
              </label>
              <input
                list="countries"
                value={formData.country}
                onChange={(e) => {
                  const selected = Country.getAllCountries().find(
                    (c) => c.name.toLowerCase() === e.target.value.toLowerCase()
                  );
                  setFormData((prev) => ({
                    ...prev,
                    country: selected?.name || e.target.value,
                    countryCode: selected?.isoCode || "",
                    state: "",
                    stateCode: "",
                    city: "",
                  }));
                  setErrors((prev) => ({ ...prev, country: "" }));
                }}
                placeholder="Select or search country"
                className="border border-gray-300 w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <datalist id="countries">
                {Country.getAllCountries().map((c) => (
                  <option key={c.isoCode} value={c.name} />
                ))}
              </datalist>
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                State
              </label>
              <input
                list="states"
                value={formData.state}
                onChange={(e) => {
                  const selected = State.getStatesOfCountry(
                    formData.countryCode
                  ).find(
                    (s) => s.name.toLowerCase() === e.target.value.toLowerCase()
                  );
                  setFormData((prev) => ({
                    ...prev,
                    state: selected?.name || e.target.value,
                    stateCode: selected?.isoCode || "",
                    city: "",
                  }));
                  setErrors((prev) => ({ ...prev, state: "" }));
                }}
                disabled={!formData.countryCode}
                placeholder="Select or search state"
                className="border border-gray-300 w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <datalist id="states">
                {formData.countryCode &&
                  State.getStatesOfCountry(formData.countryCode).map((s) => (
                    <option key={s.isoCode} value={s.name} />
                  ))}
              </datalist>
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                City
              </label>
              <input
                list="cities"
                value={formData.city}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, city: e.target.value }));
                  setErrors((prev) => ({ ...prev, city: "" }));
                }}
                disabled={!formData.stateCode}
                placeholder="Select or search city"
                className="border border-gray-300 w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <datalist id="cities">
                {formData.countryCode &&
                  formData.stateCode &&
                  City.getCitiesOfState(
                    formData.countryCode,
                    formData.stateCode
                  ).map((c) => <option key={c.name} value={c.name} />)}
              </datalist>
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Hotel Image
            </label>
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center hover:border-blue-400 transition cursor-pointer">
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
                className="hidden"
                id="hotelImage"
              />
              <label
                htmlFor="hotelImage"
                className="cursor-pointer text-gray-500"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto h-32 object-cover rounded-lg"
                  />
                ) : (
                  "Click to upload an image"
                )}
              </label>
            </div>
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Adding..." : "Add Hotel"}
          </button>

          {message && (
            <p className="mt-4 text-center text-sm font-medium text-gray-700">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}