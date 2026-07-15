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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Loading User Directory...</p>
        </div>
      </div>
    );
  }

  // Access check guard
  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="bg-white border border-gray-200 p-12 rounded-lg shadow-sm max-w-md space-y-4">
              <span className="text-4xl">🚫</span>
              <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
              <p className="text-gray-600 text-sm">
                You do not have administrative clearance to access the user directories or adjust roles.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-medium py-2 px-6 rounded-lg text-sm transition-colors cursor-pointer"
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
        return "bg-red-50 text-red-700 border border-red-200";
      case "PROJECT_MANAGER":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      default:
        return "bg-blue-50 text-blue-700 border border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  User Management
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Admin tool for directory listings, role provisioning, and account deletions
                </p>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow transition-colors flex items-center gap-2 text-sm cursor-pointer"
              >
                <span>+</span> Invite User
              </button>
            </div>
          </div>

          {/* Users Table Card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">System Role</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700 text-sm">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                            {u.name[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{u.name}</span>
                          {currentUser.id === u.id && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                              Self
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {currentUser.id === u.id ? (
                            <span className={`text-xs px-2.5 py-0.5 rounded font-medium uppercase ${getRoleColor(u.role)}`}>
                              {u.role.replace("_", " ")}
                            </span>
                          ) : (
                            <select
                              className="bg-white border border-gray-300 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {u.createdAt.substring(0, 10)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {currentUser.id !== u.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateUser}
                className="bg-white border border-gray-200 w-full max-w-md rounded-lg shadow-xl p-6 space-y-5"
              >
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <h3 className="text-lg font-bold text-gray-900">Create New User</h3>
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
                    className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1 rounded transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {formError && (
                  <p className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg text-sm font-medium">
                    {formError}
                  </p>
                )}

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="TEAM_MEMBER">Team Member</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
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
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
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