"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";


export default function DashboardPage() {

    return (

        <div className="min-h-screen bg-gray-50">


            <Navbar />


            <div className="flex">


                <Sidebar />


                <main className="p-8 flex-1">


                    <h2 className="text-3xl font-bold mb-2">
                        Dashboard
                    </h2>


                    <p className="text-gray-600 mb-8">
                        Manage your projects, tasks and team members.
                    </p>



                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                        <div className="bg-white rounded-xl shadow p-6 border">
                            <h3 className="text-gray-500">
                                Total Projects
                            </h3>

                            <p className="text-4xl font-bold mt-3">
                                0
                            </p>
                        </div>



                        <div className="bg-white rounded-xl shadow p-6 border">
                            <h3 className="text-gray-500">
                                Total Tasks
                            </h3>

                            <p className="text-4xl font-bold mt-3">
                                0
                            </p>
                        </div>



                        <div className="bg-white rounded-xl shadow p-6 border">
                            <h3 className="text-gray-500">
                                Team Members
                            </h3>

                            <p className="text-4xl font-bold mt-3">
                                0
                            </p>
                        </div>


                    </div>


                </main>


            </div>


        </div>

    );
}