"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  role: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const linkClass = (path: string) => {
    return `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-smooth border border-transparent ${
      isActive(path)
        ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
    }`;
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white min-h-[calc(100vh-68px)] p-5 flex flex-col gap-6">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">
        Navigation Menu
      </div>

      <nav className="flex flex-col gap-1.5">
        {/* Dashboard Link */}
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          {/* Dashboard Icon */}
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
            ></path>
          </svg>
          Dashboard
        </Link>

        {/* Projects Link */}
        <Link href="/projects" className={linkClass("/projects")}>
          {/* Projects Icon */}
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            ></path>
          </svg>
          Projects
        </Link>

        {/* Tasks Link */}
        <Link href="/tasks" className={linkClass("/tasks")}>
          {/* Tasks Icon */}
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            ></path>
          </svg>
          Tasks
        </Link>

        {/* Users Link - Admin Only */}
        {user?.role === "ADMIN" && (
          <Link href="/users" className={linkClass("/users")}>
            {/* Users Icon */}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
            Users
          </Link>
        )}
      </nav>
    </aside>
  );
}