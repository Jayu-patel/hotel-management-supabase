"use client"
import { useState } from "react"
import { toast } from "react-toastify"
import { supabase } from "../utils/supabase-client"

export default function Contact() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [errors, setErrors] = useState({})

    const validate = () => {
        let newErrors = {}

        if (!name.trim()) newErrors.name = "Name is required"
        if (!email.trim()) {
            newErrors.email = "Email is required"
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) newErrors.email = "Enter a valid email address"
        }
        if (!message.trim()) newErrors.message = "Message is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const submit =async() => {
        if (!validate()) return

        const {error} = await supabase.from("messages").insert({name, email, message}).single()

        if(error){
            return toast.error(error.message)
        }
        else{
            toast.success("Message sent")
            setName("")
            setEmail("")
            setMessage("")
        }
    }

    return (
        <div className="text-[#4B5563] md:mb-44 mt-10 md:w-[80%] mx-auto">
            <div className="w-full text-center my-5">
                <h1 className="mx-auto font-normal text-2xl md:text-3xl">
                    CONTACT <span className="text-[#1F2937]">US</span>
                </h1>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-10">
                <div className="flex-1">
                    <img className="w-full mx-auto object-contain" src="/contact.jpg" alt="" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                    
                    {/* Name Input */}
                    <div>
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        <input
                            className={`bg-[#FFFFFF] rounded-[1.125rem] p-4 border ${errors.name ? "border-red-500" : "border-[#D9D9D9]"} w-full`}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder='Name'
                            type="text"
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        <input
                            className={`bg-[#FFFFFF] rounded-[1.125rem] p-4 border ${errors.email ? "border-red-500" : "border-[#D9D9D9]"} w-full`}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder='Your Email'
                            type="email"
                        />
                    </div>

                    {/* Message Input */}
                    <div className="w-full h-[40%]">
                        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                        <textarea
                            className={`w-full h-full bg-[#FFFFFF] rounded-[1.125rem] p-4 border ${errors.message ? "border-red-500" : "border-[#D9D9D9] resize-none"}`}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder='Your Message'
                            name="message"
                        />
                    </div>

                    <button
                        className='bg-[#5f6fff] text-white py-[2.5%] rounded-[1.125rem] cursor-pointer hover:bg-[#4a518f] transition-all duration-100'
                        onClick={submit}
                    >
                        Send Message
                    </button>
                </div>
            </div>
        </div>
    )
}
