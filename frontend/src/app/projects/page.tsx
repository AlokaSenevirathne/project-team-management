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
    } catch (error: unknown) {
      console.error("Failed to fetch projects", error);
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
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
      setTimeout(() => {
        setCurrentUser(JSON.parse(userData));
      }, 0);
    }

    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchUsers()]);
      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      setFormError(err.response?.data?.message || "Failed to create project");
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
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      setMemberError(err.response?.data?.message || "Failed to add member");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Loading Projects...</p>
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
                  Projects
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Create, track and assign team members to projects
                </p>
              </div>
              
              {currentUser && (currentUser.role === "ADMIN" || currentUser.role === "PROJECT_MANAGER") && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow transition-colors flex items-center gap-2 text-sm cursor-pointer"
                >
                  <span>+</span> Create Project
                </button>
              )}
            </div>
          </div>

          {/* Project Grid */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const completion = getCompletionPercentage(project.tasks);
                return (
                  <div
                    key={project.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {project.name}
                        </h3>
                        {currentUser?.role === "ADMIN" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Delete Project"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2 h-10">
                        {project.description || "No project description provided."}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-blue-600">{completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${completion}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Details */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-sm text-gray-600">
                      <span>👤 Mgr: {project.manager.name}</span>
                      <span>📋 Tasks: {project.tasks?.length || 0}</span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => openProjectDetails(project)}
                      className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-lg text-sm font-medium transition-colors border border-gray-200 cursor-pointer"
                    >
                      View Details & Members
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 p-16 rounded-lg text-center text-gray-500 flex flex-col items-center justify-center">
              <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
              <h3 className="text-lg font-semibold text-gray-700">No Projects Found</h3>
              <p className="text-sm mt-1 max-w-sm">
                There are no projects assigned to your account. Project managers or administrators can assign you to projects.
              </p>
            </div>
          )}

          {/* Project Details Modal */}
          {showDetailModal && selectedProject && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white border border-gray-200 w-full max-w-3xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedProject.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Managed by <span className="font-semibold text-gray-900">{selectedProject.manager.name}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedProject(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {selectedProject.description || "No description provided for this project."}
                    </p>
                  </div>

                  {/* Tasks List Summary */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Project Tasks ({selectedProject.tasks.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedProject.tasks.length > 0 ? (
                        selectedProject.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-gray-50 border border-gray-200 p-3.5 rounded-lg flex items-center justify-between text-sm"
                          >
                            <span className="font-medium text-gray-900 truncate mr-3">
                              {task.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              task.status === "COMPLETED"
                                ? "bg-green-100 text-green-700"
                                : task.status === "IN_PROGRESS"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {task.status.replace("_", " ")}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-6 bg-gray-50 border border-gray-200 border-dashed rounded-lg text-gray-500">
                          No tasks created for this project yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Members Management */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Team Members ({selectedProject.members.length})
                    </h4>

                    {/* Add Member Form (PM/Admin only) */}
                    {isProjectManager(selectedProject) && (
                      <form onSubmit={handleAddMember} className="flex flex-col gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <label className="text-sm font-medium text-gray-700">
                          Assign User to Project
                        </label>
                        <div className="flex gap-3 mt-1.5">
                          <select
                            className="flex-1 bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                          >
                            Add Member
                          </button>
                        </div>
                        {memberError && (
                          <p className="text-sm text-red-600 font-medium mt-1">
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
                            className="flex justify-between items-center bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                                {member.user.name[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {member.user.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {member.user.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-medium">
                                {member.user.role.replace("_", " ")}
                              </span>
                              {isProjectManager(selectedProject) && (
                                <button
                                  onClick={() => handleRemoveMember(member.userId)}
                                  className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-gray-200 transition-colors cursor-pointer"
                                  title="Remove Member"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">
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
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateProject}
                className="bg-white border border-gray-200 w-full max-w-md rounded-lg shadow-xl p-6 space-y-5"
              >
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <h3 className="text-lg font-bold text-gray-900">Create New Project</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setName("");
                      setDescription("");
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
                    Project Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g. Website Redesign"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Project Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Provide a detailed summary of project scope, timelines, etc..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setName("");
                      setDescription("");
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