"use client"
import { useContext, useState } from 'react'
import ConfirmationPopup from '../components/PopUp';
import Link from "next/link";
import { AuthContext } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const {userData : data, logout, session, role} = useContext(AuthContext)

  const [showPopup, setShowPopup] = useState(false)
  const router = useRouter()

  const confirmLogout=()=>{
    logout();
    setShowPopup(false)
  }
  const cancelLogout=()=>{
    setShowPopup(false)
  }
  
  const links = [
    {name: "HOME", href: "/"},
    {name: "ABOUT", href: "/about"},
    {name: "CONTACT", href: "/contact"},
  ]

  return (
    <div className='flex items-center justify-between text-sm py-4 border-b border-b-gray-400 text-white bg-[#5f6fff]'>
      <div className='absolute'>
        <ConfirmationPopup
          showPopup={showPopup}
          handleConfirm={confirmLogout}
          handleCancel={cancelLogout}
          header={"Logout confirmation"}
          message={"Are you sure you want to logout?"} 
          btnMessage={"Log Out"} 
        />
      </div>
        <h1 onClick={()=>{router.push("/")}} className='text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold cursor-pointer ml-[2.5%]'>
          LOGO
        </h1>
      <ul className='hidden md:flex items-start gap-5 font-medium'>
        {
          links.map(({name, href})=>{
            
            return (
              <Link prefetch={true} key={name} href={href}>
                <li className='py-1'>{name}</li>
                <hr className={`border-none outline-none h-0.5 bg-[#5f6fff] w-3/5 m-auto hidden`} />
              </Link>
            )
          })
        }
      </ul>
      <div className='flex items-center gap-4 mr-[2.5%]'>
        {
          session ? 
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-8 rounded-full' src={data?.profile || '/profile_pic.png'} alt='loading...'/>
            <img className='w-2.5' src='/dropdown_icon.svg' alt='dropdown'/>
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                {
                    role == "admin" ?
                    <p onClick={()=>{router.push("/admin")}} className='hover:text-black cursor-pointer'>Dashboard</p> :
                    <>
                      {/* <p onClick={()=>{}} className='hover:text-black cursor-pointer'>My Profile</p> */}
                      <p onClick={()=>{router.push('/bookings')}} className='hover:text-black cursor-pointer'>My Bookings</p>
                    </>
                }
                <p onClick={()=>{setShowPopup(true);}} className='hover:text-black cursor-pointer'>Logout</p>
              </div>
            </div>
          </div>
          :
          <button onClick={()=>{router.push("/login")}} className='text-black bg-white px-8 py-3 rounded-full font-light cursor-pointer'>Create account</button>
        }

      </div>
    </div>
  )
}