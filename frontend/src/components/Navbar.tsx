"use client";

import { useRouter } from "next/navigation";


export default function Navbar() {

    const router = useRouter();


    const logout = () => {

        localStorage.removeItem("token");

        router.push("/");

    };


    return (
        <header className="bg-white shadow px-8 py-4 flex justify-between items-center">

            <h1 className="text-xl font-bold">
                Project Management System
            </h1>


            <button
                onClick={logout}
                className="bg-black text-white px-4 py-2 rounded"
            >
                Logout
            </button>

        </header>
    );
}