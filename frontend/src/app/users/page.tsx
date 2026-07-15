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
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TEAM_MEMBER");
  const [formError, setFormError] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 403) {
        // Forbidden - access denied will be handled visually
      }
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
      setCurrentUser(JSON.parse(userData));
    }

    const init = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };

    init();
  }, [router]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError("All fields are required.");
      return;
    }

    try {
      await api.post("/users", { name, email, password, role });
      setName("");
      setEmail("");
      setPassword("");
      setRole("TEAM_MEMBER");
      setShowCreateModal(false);
      await fetchUsers();
    } catch (error: any) {
      console.error(error);
      setFormError(error.response?.data?.message || "Failed to create user");
    }
  };

  const handleUpdateRole = async (userId: number, nextRole: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    try {
      await api.put(`/users/${userId}`, {
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: nextRole
      });
      await fetchUsers();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this user? This will remove all their task assignments, project memberships, and comments.");
    if (!confirmed) return;

    try {
      await api.delete(`/users/${userId}`);
      await fetchUsers();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Loading User Directory...</p>
        </div>
      </div>
    );
  }

  // Access check guard
  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl max-w-md space-y-4">
              <span className="text-4xl">🚫</span>
              <h2 className="text-xl font-black text-white">Access Denied</h2>
              <p className="text-slate-400 text-sm">
                You do not have administrative clearance to access the user directories or adjust roles.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-xl text-xs transition-smooth cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                User Management
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Admin tool for directory listings, role provisioning, and account deletions
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/10 transition-smooth flex items-center gap-2 text-sm cursor-pointer"
            >
              <span>+</span> Invite User
            </button>
          </div>

          {/* Users Table Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-premium">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/20 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">System Role</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300 text-sm">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/55 transition-smooth">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
                            {u.name[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-200">{u.name}</span>
                          {currentUser.id === u.id && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-black uppercase">
                              Self
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {currentUser.id === u.id ? (
                            <span className={`text-[10px] px-2.5 py-0.5 rounded font-black uppercase tracking-wider ${getRoleColor(u.role)}`}>
                              {u.role.replace("_", " ")}
                            </span>
                          ) : (
                            <select
                              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            >
                              <option value="TEAM_MEMBER">Team Member</option>
                              <option value="PROJECT_MANAGER">Project Manager</option>
                              <option value="ADMIN">Administrator</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {u.createdAt.substring(0, 10)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {currentUser.id !== u.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-slate-850 transition-smooth cursor-pointer"
                            title="Delete User"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create User Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateUser}
                className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Create New User</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setName("");
                      setEmail("");
                      setPassword("");
                      setRole("TEAM_MEMBER");
                      setFormError("");
                    }}
                    className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1 rounded transition-smooth cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {formError && (
                  <p className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2 rounded-lg text-xs font-semibold">
                    {formError}
                  </p>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-smooth"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-smooth"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-smooth"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Role
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="TEAM_MEMBER">Team Member</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setName("");
                      setEmail("");
                      setPassword("");
                      setRole("TEAM_MEMBER");
                      setFormError("");
                    }}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-smooth cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-smooth shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    Save User
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
