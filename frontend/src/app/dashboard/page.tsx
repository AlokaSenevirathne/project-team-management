"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";

export default function DashboardPage() {

    const [projectCount, setProjectCount] = useState(0);
    const [taskCount, setTaskCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);

    const fetchDashboardData = async () => {

        try {

            const [projectsResponse, tasksResponse] = await Promise.all([
                api.get("/projects"),
                api.get("/tasks")
            ]);

            const projects = projectsResponse.data;
            const tasks = tasksResponse.data;

            setProjectCount(projects.length);
            setTaskCount(tasks.length);

            setCompletedCount(
                tasks.filter(
                    (task: any) => task.status === "COMPLETED"
                ).length
            );

        } catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {

        fetchDashboardData();

    }, []);

    return (

        <div className="min-h-screen bg-gray-50">

            <Navbar />

            <div className="flex">

                <Sidebar />

                <main className="flex-1 p-8">

                    <h2 className="text-3xl font-bold mb-2">
                        Dashboard
                    </h2>

                    <p className="text-gray-600 mb-8">
                        Manage your projects, tasks and team members.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Total Projects */}

                        <div className="bg-white rounded-xl shadow p-6 border">

                            <h3 className="text-gray-500">
                                Total Projects
                            </h3>

                            <p className="text-4xl font-bold mt-3">
                                {projectCount}
                            </p>

                        </div>

                        {/* Total Tasks */}

                        <div className="bg-white rounded-xl shadow p-6 border">

                            <h3 className="text-gray-500">
                                Total Tasks
                            </h3>

                            <p className="text-4xl font-bold mt-3">
                                {taskCount}
                            </p>

                        </div>

                        {/* Completed Tasks */}

                        <div className="bg-white rounded-xl shadow p-6 border">

                            <h3 className="text-gray-500">
                                Completed Tasks
                            </h3>

                            <p className="text-4xl font-bold mt-3">
                                {completedCount}
                            </p>

                        </div>

                    </div>

                </main>

            </div>

        </div>

    );

}