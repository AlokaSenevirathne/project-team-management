"use client";

import { useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";


export default function LoginPage() {

    const router = useRouter();

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");


    const handleLogin = async () => {

        try {

            const response = await api.post("/auth/login",{
                email,
                password
            });


            localStorage.setItem(
                "token",
                response.data.token
            );


            router.push("/dashboard");


        } catch(error){

            alert("Login failed");

        }

    };


    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white p-8 rounded-xl shadow-md w-96">

                <h1 className="text-2xl font-bold mb-6">
                    Login
                </h1>


                <input
                    className="border p-2 w-full mb-4 rounded"
                    placeholder="Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />


                <input
                    className="border p-2 w-full mb-4 rounded"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />


                <button
                    onClick={handleLogin}
                    className="bg-black text-white w-full p-2 rounded"
                >
                    Login
                </button>

            </div>

        </div>

    );
}