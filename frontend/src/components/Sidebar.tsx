"use client";

import Link from "next/link";


export default function Sidebar() {

    return (

        <aside className="w-64 bg-white shadow min-h-screen p-6">

            <h2 className="text-lg font-bold mb-6">
                Menu
            </h2>


            <nav className="flex flex-col gap-4">

                <Link href="/dashboard">
                    Dashboard
                </Link>


                <Link href="/projects">
                    Projects
                </Link>


                <Link href="/tasks">
                    Tasks
                </Link>


            </nav>

        </aside>

    );
}