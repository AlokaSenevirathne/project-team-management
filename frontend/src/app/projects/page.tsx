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
  status: string;
  priority: string;
}

interface ProjectMember {
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  managerId: number;
  createdAt: string;
  manager: {
    id: number;
    name: string;
    email: string;
  };
  tasks: Task[];
  members: ProjectMember[];
}

export default function ProjectsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals / Forms state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Create Project inputs
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Add Member input
  const [selectedUserId, setSelectedUserId] = useState("");
  const [memberError, setMemberError] = useState("");

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data);
    } catch (error: any) {
      console.error("Failed to fetch projects", error);
      if (error.response?.status === 401) {
        router.push("/");
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
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
      await Promise.all([fetchProjects(), fetchUsers()]);
      setLoading(false);
    };

    init();
  }, [router]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Project name is required.");
      return;
    }

    try {
      await api.post("/projects", { name, description });
      setName("");
      setDescription("");
      setShowCreateModal(false);
      await fetchProjects();
    } catch (error: any) {
      console.error(error);
      setFormError(error.response?.data?.message || "Failed to create project");
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this project? All associated tasks and comments will be permanently deleted.");
    if (!confirmed) return;

    try {
      await api.delete(`/projects/${projectId}`);
      await fetchProjects();
      if (selectedProject?.id === projectId) {
        setShowDetailModal(false);
        setSelectedProject(null);
      }
    } catch (error) {
      console.error("Failed to delete project", error);
      alert("Failed to delete project");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError("");

    if (!selectedUserId || !selectedProject) {
      setMemberError("Please select a user to add.");
      return;
    }

    try {
      await api.post(`/projects/${selectedProject.id}/members`, {
        userId: Number(selectedUserId),
      });

      setSelectedUserId("");
      
      // Refresh current project detail modal
      const updatedProjResponse = await api.get(`/projects/${selectedProject.id}`);
      setSelectedProject(updatedProjResponse.data);
      
      // Refresh list
      await fetchProjects();
    } catch (error: any) {
      console.error(error);
      setMemberError(error.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedProject) return;
    const confirmed = window.confirm("Are you sure you want to remove this member from the project?");
    if (!confirmed) return;

    try {
      await api.delete(`/projects/${selectedProject.id}/members/${userId}`);
      
      // Refresh detail modal
      const updatedProjResponse = await api.get(`/projects/${selectedProject.id}`);
      setSelectedProject(updatedProjResponse.data);
      
      // Refresh list
      await fetchProjects();
    } catch (error) {
      console.error(error);
      alert("Failed to remove member");
    }
  };

  const openProjectDetails = async (project: Project) => {
    try {
      const response = await api.get(`/projects/${project.id}`);
      setSelectedProject(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch project details");
    }
  };

  const getCompletionPercentage = (tasks: Task[]) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    return Math.round((completed / tasks.length) * 100);
  };

  const isProjectManager = (project: Project) => {
    if (!currentUser) return false;
    return currentUser.role === "ADMIN" || project.managerId === currentUser.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Loading Projects...</p>
        </div>
      </div>
    );
  }

  // Filter out users who are already project members or are the manager
  const getEligibleMembers = () => {
    if (!selectedProject) return [];
    const memberIds = selectedProject.members.map((m) => m.userId);
    return users.filter(
      (u) => !memberIds.includes(u.id) && u.id !== selectedProject.managerId
    );
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
                Projects
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Create, track and assign team members to projects
              </p>
            </div>
            
            {currentUser && (currentUser.role === "ADMIN" || currentUser.role === "PROJECT_MANAGER") && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/10 transition-smooth flex items-center gap-2 text-sm cursor-pointer"
              >
                <span>+</span> Create Project
              </button>
            )}
          </div>

          {/* Project Grid */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const completion = getCompletionPercentage(project.tasks);
                return (
                  <div
                    key={project.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-5 hover:border-slate-700 transition-smooth shadow-premium"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-extrabold text-lg text-slate-200 truncate group-hover:text-white">
                          {project.name}
                        </h3>
                        {currentUser?.role === "ADMIN" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-smooth cursor-pointer"
                            title="Delete Project"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 h-8">
                        {project.description || "No project description provided."}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-blue-400">{completion}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-smooth"
                          style={{ width: `${completion}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Details */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-[11px] font-semibold text-slate-400">
                      <span>👤 Mgr: {project.manager.name}</span>
                      <span>📋 Tasks: {project.tasks?.length || 0}</span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => openProjectDetails(project)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-smooth border border-slate-700/50 cursor-pointer"
                    >
                      View Details & Members
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-16 rounded-2xl text-center text-slate-500 shadow-premium flex flex-col items-center justify-center">
              <svg className="w-16 h-16 mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
              <h3 className="text-lg font-bold text-slate-400">No Projects Found</h3>
              <p className="text-xs mt-1 max-w-sm">
                There are no projects assigned to your account. Project managers or administrators can assign you to projects.
              </p>
            </div>
          )}

          {/* Project Details Modal */}
          {showDetailModal && selectedProject && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">
                      {selectedProject.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Managed by <span className="text-slate-300 font-bold">{selectedProject.manager.name}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedProject(null);
                    }}
                    className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-smooth cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Description
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-slate-850">
                      {selectedProject.description || "No description provided for this project."}
                    </p>
                  </div>

                  {/* Tasks List Summary */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Project Tasks ({selectedProject.tasks.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedProject.tasks.length > 0 ? (
                        selectedProject.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-slate-300 truncate mr-3">
                              {task.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              task.status === "COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : task.status === "IN_PROGRESS"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-slate-500/10 text-slate-400"
                            }`}>
                              {task.status.replace("_", " ")}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-6 bg-slate-950/20 border border-slate-850 border-dashed rounded-xl text-slate-500">
                          No tasks created for this project yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Members Management */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Team Members ({selectedProject.members.length})
                    </h4>

                    {/* Add Member Form (PM/Admin only) */}
                    {isProjectManager(selectedProject) && (
                      <form onSubmit={handleAddMember} className="flex flex-col gap-2 p-4 bg-slate-950/30 border border-slate-850 rounded-xl">
                        <label className="text-[10px] font-bold uppercase text-slate-400">
                          Assign User to Project
                        </label>
                        <div className="flex gap-3 mt-1.5">
                          <select
                            className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                          >
                            <option value="">-- Choose User --</option>
                            {getEligibleMembers().map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.email} - {u.role.replace("_", " ")})
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-smooth shadow-md shadow-blue-500/10 cursor-pointer"
                          >
                            Add Member
                          </button>
                        </div>
                        {memberError && (
                          <p className="text-[10px] text-rose-400 font-semibold mt-1">
                            {memberError}
                          </p>
                        )}
                      </form>
                    )}

                    {/* Members List */}
                    <div className="space-y-2">
                      {selectedProject.members.length > 0 ? (
                        selectedProject.members.map((member) => (
                          <div
                            key={member.userId}
                            className="flex justify-between items-center bg-slate-950/20 border border-slate-850 px-4 py-3 rounded-xl hover:border-slate-800 transition-smooth"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                {member.user.name[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-200">
                                  {member.user.name}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {member.user.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold border border-slate-700">
                                {member.user.role.replace("_", " ")}
                              </span>
                              {isProjectManager(selectedProject) && (
                                <button
                                  onClick={() => handleRemoveMember(member.userId)}
                                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800 transition-smooth cursor-pointer"
                                  title="Remove Member"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-slate-950/20 border border-slate-850 rounded-xl text-slate-500 text-xs">
                          No team members assigned to this project yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Project Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateProject}
                className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Create New Project</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setName("");
                      setDescription("");
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
                    Project Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-smooth"
                    placeholder="e.g. Website Redesign"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Project Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-smooth"
                    placeholder="Provide a detailed summary of project scope, timelines, etc..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setName("");
                      setDescription("");
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
                    Save Project
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