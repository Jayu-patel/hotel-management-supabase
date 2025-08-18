"use client"
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {supabase} from '../utils/supabase-client'

export default function Login() {
    const [state, setState] = useState('Login')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [show, setShow] = useState(false);
    const [mounted, setMounted] = useState(false)

    const router =  useRouter()

    const formSubmit =async(e)=>{
      if(state === "Sign Up"){
          if(!email) return toast.error("Please Enter your email!");
          if(email.includes(" ") || !emailRegex.test(email)) return toast.error("Please enter a valid email address.");

          if(!password) return toast.error("Please Enter your password!");
          if(password.includes(" ")) return toast.error("Passwod cannot contain spaces");
          if(password.length < 5) return toast.error("Password must be at least 5 characters long.");
          
          setLoading(true)
          
        const {error: signUpError} = await supabase.auth.signUp({email, password})

        if(signUpError){
            toast.error(signUpError.message)
            return setLoading(false)
        }
        setLoading(false)
      }
      else{
          if(!email) return toast.error("Please Enter your email!");
          if(email.includes(" ") || !emailRegex.test(email)) return toast.error("Please enter a valid email address.");
          if(!password) return toast.error("Please Enter your password!");
          if(password.includes(" ")) return toast.error("Passwod cannot contain spaces");
          if(password.length < 5) return toast.error("Password must be at least 5 characters long.");

          setLoading(true)

        const { data, error: signInError} = await supabase.auth.signInWithPassword({email, password})

        if(signInError){
            toast.error(signInError.message)
            return setLoading(false)
        }
        console.log(data)
        router.push("/")
        setLoading(false)
      }
    }
    useEffect(()=>{
        setMounted(true)
    },[])

    if(!mounted) return <></>
    return (
        <div className='min-h-[80vh] flex items-center'>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
                <p className='text-2xl font-semibol'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
                <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>

                
                <div className='w-full'>
                    <p>Email</p>
                    <input
                        className='border border-zinc-300 rounded w-full p-2 mt-1'
                        type="email" name="email" 
                        onChange={e=>{setEmail(e.target.value)}}
                        placeholder="Enter your email" 
                        value={email} required 
                    />
                </div>

                <div className="w-full">
                    <p>Password</p>
                    <div className='relative'>
                        <input
                            type={show ? 'text' : 'password'}
                            value={password}
                            onChange={e=>{setPassword(e.target.value)}}
                            placeholder="Enter your password"
                            className="w-full border border-zinc-300 rounded p-2 mt-1"
                        />

                        <button
                            type="button"
                            onClick={() => setShow(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
                            aria-label={show ? 'Hide password' : 'Show password'}
                        > {show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                {
                    loading 
                    ? <button disabled className='bg-[#5f6fff] text-white w-full py-2 rounded-md text-base cursor-pointer'>Loading...</button> 
                    : <button onClick={formSubmit} className='bg-[#5f6fff] text-white w-full py-2 rounded-md text-base cursor-pointer'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</button>
                }
                {
                    state === 'Sign Up'
                    ? <p>Already have an account? <span onClick={()=>setState('Login')} className='text-[#5f6fff] underline cursor-pointer'>Login</span></p>
                    : <p>Create an new account? <span onClick={()=>setState('Sign Up')} className='text-[#5f6fff] underline cursor-pointer'>click here</span></p>
                }
                {
                    state === "Sign Up"
                    ? <></>
                    : <p>Forgot Password? <span onClick={()=>{router.push("/")}} className='text-[#5f6fff] underline cursor-pointer'>click here</span> </p>
                }
            </div>
        </div>
    )
}