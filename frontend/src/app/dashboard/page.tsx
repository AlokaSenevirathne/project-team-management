"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate?: string;
  project: {
    name: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [projectsResponse, tasksResponse, usersResponse] = await Promise.all([
        api.get("/projects"),
        api.get("/tasks"),
        api.get("/users").catch(() => ({ data: [] })) // Fallback if user doesn't have permission to list users
      ]);

      const projects = projectsResponse.data;
      const tasks = tasksResponse.data;
      const users = usersResponse.data;

      setProjectCount(projects.length);
      setTaskCount(tasks.length);
      setMemberCount(users.length || 1); // fallback to 1 (self) if API is restricted

      const completed = tasks.filter((task: Task) => task.status === "COMPLETED").length;
      setCompletedCount(completed);

      // Get recent tasks (up to 4, sorted or just slice of outstanding tasks)
      const pendingTasks = tasks.filter((task: Task) => task.status !== "COMPLETED");
      setRecentTasks(pendingTasks.slice(0, 4));

    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/");
      return;
    }

    if (userData) {
      setTimeout(() => {
        setCurrentUser(JSON.parse(userData));
      }, 0);
    }

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate completion percentage
  const completionRate = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-sm">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {currentUser?.name}!
              </h1>
              <p className="text-gray-600 text-sm">
                Here is a summary of your workspace activities. You have{" "}
                <span className="font-semibold text-gray-900">
                  {taskCount - completedCount} pending tasks
                </span>{" "}
                waiting for your attention.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Projects Card */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Projects
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{projectCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Tasks Card */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Tasks
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{taskCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Completed Tasks Card */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed Tasks
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Team Members Card */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Members
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{memberCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Dashboard Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Progress Visualization */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Task Completion Rate
              </h3>
              
              <div className="flex flex-col items-center justify-center py-4">
                {/* SVG Progress Circle */}
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="stroke-gray-200"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="stroke-blue-600 transition-all duration-500"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={351.86}
                      strokeDashoffset={351.86 - (351.86 * completionRate) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
                    <span className="text-xs text-gray-500 font-medium">Completed</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-4 text-center">
                  You have completed {completedCount} out of {taskCount} total assigned tasks.
                </p>
              </div>
            </div>

            {/* Recent Pending Tasks List */}
            <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Active Tasks Checklist
                </h3>
                <span className="text-xs text-gray-500">
                  Showing first {recentTasks.length} pending tasks
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0">
                          <div className="w-full h-full rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {task.title}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                              task.priority === "HIGH" 
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : task.priority === "MEDIUM"
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {task.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <span>📂</span> {task.project.name}
                            </span>
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <span>📅</span> {task.dueDate.substring(0, 10)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p className="text-sm font-medium">No pending tasks found</p>
                    <p className="text-xs mt-1">All caught up! Great job.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}