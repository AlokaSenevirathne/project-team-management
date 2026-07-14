"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "PROJECT_MANAGER":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    }
  };

  const formatRole = (role: string) => {
    if (!role) return "";
    return role.replace("_", " ");
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-3.5 flex justify-between items-center text-white">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/20">
          TF
        </div>
        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          TaskFlow
        </h1>
      </div>

      {/* User Profile & Actions */}
      <div className="flex items-center gap-6">
        {user && (
          <div className="flex items-center gap-3 pr-4 border-r border-slate-800">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
              {getInitials(user.name)}
            </div>

            {/* Profile Info */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold leading-none text-slate-200">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 leading-none">
                {user.email}
              </span>
            </div>

            {/* Role Badge */}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getRoleColor(user.role)}`}>
              {formatRole(user.role)}
            </span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-smooth bg-slate-800/50 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-800 cursor-pointer"
        >
          {/* Logout SVG Icon */}
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}