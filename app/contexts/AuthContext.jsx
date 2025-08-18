"use client"
import { createContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabase-client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export const AuthContext = createContext()

const AuthContextProvider = ({children}) => {
    const [session, setSession] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchUserRole = async (userId) => {
        const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single();
        
        if(error){
            return toast.error(error.message);
        }

        setRole(data?.role || null);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setRole(null);
        router.push("/");
    };

    useEffect(() => {
        const fetchSession = async() => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);

            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setRole(null);
            }
        };

        fetchSession();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_, session) => {
                setSession(session);
                if (session?.user) {
                    setTimeout(()=>{
                        fetchUserRole(session.user.id);
                    })
                } else {
                    setRole(null);
                }
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const value = {
        session, role,
        loading,
        logout
    }
    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider