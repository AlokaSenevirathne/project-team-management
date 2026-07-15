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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate completion percentage
  const completionRate = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-850 p-8 rounded-2xl border border-slate-800 shadow-xl">
            {/* Ambient overlay */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none translate-x-12 -translate-y-12"></div>
            
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200 bg-blue-900/50 border border-blue-600/35 px-3 py-1 rounded-full">
                TaskFlow Workspace
              </span>
              <h2 className="text-3xl font-extrabold text-white leading-tight mt-3">
                Welcome back, {currentUser?.name}!
              </h2>
              <p className="text-blue-100 text-sm font-medium max-w-xl">
                Here is a summary of your workspace activities. You have{" "}
                <span className="font-bold text-white underline decoration-wavy decoration-blue-300">
                  {taskCount - completedCount} pending tasks
                </span>{" "}
                waiting for your attention.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Projects Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-premium flex items-center justify-between group hover:border-blue-500/30 transition-smooth">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Projects
                </span>
                <p className="text-3xl font-extrabold text-white">{projectCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-smooth">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
              </div>
            </div>

            {/* Total Tasks Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-premium flex items-center justify-between group hover:border-indigo-500/30 transition-smooth">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Tasks
                </span>
                <p className="text-3xl font-extrabold text-white">{taskCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-smooth">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>

            {/* Completed Tasks Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-premium flex items-center justify-between group hover:border-emerald-500/30 transition-smooth">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Completed Tasks
                </span>
                <p className="text-3xl font-extrabold text-white">{completedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-smooth">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>

            {/* Team Members Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-premium flex items-center justify-between group hover:border-pink-500/30 transition-smooth">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Team Members
                </span>
                <p className="text-3xl font-extrabold text-white">{memberCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-smooth">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Lower Dashboard Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Progress Visualization */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-premium flex flex-col items-center justify-center text-center space-y-4">
              <h3 className="text-lg font-bold text-white self-start">
                Task Completion Rate
              </h3>
              
              <div className="relative flex items-center justify-center py-6">
                {/* SVG Progress Circle */}
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="stroke-slate-800"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="stroke-blue-500 transition-smooth"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * completionRate) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white">{completionRate}%</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    Completed
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-400 font-medium px-4">
                Great job! You have completed {completedCount} out of {taskCount} total assigned project tasks. Keep it up!
              </p>
            </div>

            {/* Recent Pending Tasks List */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-premium flex flex-col space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                  Active Tasks Checklist
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  Showing first {recentTasks.length} pending tasks
                </span>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto max-h-[260px] pr-2">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 rounded-xl flex items-start gap-4 transition-smooth"
                    >
                      <div className="mt-1 flex items-center justify-center w-5 h-5 rounded-full border-2 border-blue-500/30 text-blue-400 bg-blue-500/5">
                        •
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-sm font-bold text-slate-200 truncate">
                            {task.title}
                          </h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold tracking-wider ${
                            task.priority === "HIGH" 
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : task.priority === "MEDIUM"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          {task.description || "No description provided."}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-semibold">
                          <span className="flex items-center gap-1">
                            📂 Project: <span className="text-slate-400">{task.project.name}</span>
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              📅 Due: <span className="text-slate-400">{task.dueDate.substring(0, 10)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500">
                    <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p className="text-sm font-semibold">No pending tasks found</p>
                    <p className="text-xs mt-1">Excellent! You are all caught up.</p>
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