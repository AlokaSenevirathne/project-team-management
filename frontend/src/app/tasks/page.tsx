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

interface Project {
  id: number;
  name: string;
  managerId: number;
  manager: {
    id: number;
    name: string;
  };
  members: Array<{
    userId: number;
    user: User;
  }>;
}

interface TaskComment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate?: string;
  projectId: number;
  assignedTo: number | null;
  project: {
    id: number;
    name: string;
    managerId: number;
  };
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export default function TasksPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // Form Inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [eligibleAssignees, setEligibleAssignees] = useState<User[]>([]);
  const [formError, setFormError] = useState("");

  // Task Details Modal & Comments state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProjectsAndUsers = async () => {
    try {
      const [projResp, userResp] = await Promise.all([
        api.get("/projects"),
        api.get("/users").catch(() => ({ data: [] })),
      ]);
      setProjects(projResp.data);
      setUsers(userResp.data);
    } catch (error) {
      console.error(error);
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
      await Promise.all([fetchTasks(), fetchProjectsAndUsers()]);
      setLoading(false);
    };

    init();
  }, [router]);

  // Dynamically filter eligible assignees when selected project changes
  useEffect(() => {
    if (projectId) {
      const selectedProj = projects.find((p) => p.id === Number(projectId));
      if (selectedProj) {
        // Collect members
        const membersList = selectedProj.members.map((m) => m.user);
        // Include manager as also eligible
        const managerUser = users.find((u) => u.id === selectedProj.managerId);
        
        const combined = [...membersList];
        if (managerUser && !combined.some((u) => u.id === managerUser.id)) {
          combined.push(managerUser);
        }
        
        setEligibleAssignees(combined);
      } else {
        setEligibleAssignees([]);
      }
    } else {
      setEligibleAssignees([]);
    }
  }, [projectId, projects, users]);

  // Load comments for selected task
  const fetchComments = async (taskId: number) => {
    try {
      const response = await api.get(`/tasks/${taskId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  };

  const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !projectId) {
      setFormError("Task title and project selection are required.");
      return;
    }

    const payload = {
      title,
      description,
      priority,
      dueDate: dueDate || null,
      projectId: Number(projectId),
      assignedTo: assignedTo ? Number(assignedTo) : null,
    };

    try {
      if (editMode && editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, payload);
      } else {
        await api.post("/tasks", payload);
      }
      clearForm();
      await fetchTasks();
    } catch (error: any) {
      console.error(error);
      setFormError(error.response?.data?.message || "Operation failed.");
    }
  };

  const handleUpdateStatus = async (taskId: number, nextStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: nextStatus });
      await fetchTasks();
      
      // Update selectedTask if detail modal is open
      if (selectedTask?.id === taskId) {
        setSelectedTask((prev) => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update task status.");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      await fetchTasks();
      if (selectedTask?.id === taskId) {
        setShowDetailModal(false);
        setSelectedTask(null);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete task.");
    }
  };

  const openTaskDetails = async (task: Task) => {
    setSelectedTask(task);
    await fetchComments(task.id);
    setShowDetailModal(true);
  };

  const openCreateMode = () => {
    clearForm();
    setEditMode(false);
    setShowFormModal(true);
  };

  const openEditMode = (task: Task) => {
    setEditMode(true);
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setProjectId(String(task.projectId));
    setAssignedTo(task.assignedTo ? String(task.assignedTo) : "");
    setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : "");
    setShowFormModal(true);
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setProjectId("");
    setAssignedTo("");
    setEditingTaskId(null);
    setEditMode(false);
    setShowFormModal(false);
    setFormError("");
  };

  // Add Comment Flow
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTask) return;

    setCommentLoading(true);
    try {
      await api.post(`/tasks/${selectedTask.id}/comments`, {
        content: newCommentText,
      });
      setNewCommentText("");
      await fetchComments(selectedTask.id);
    } catch (error) {
      console.error(error);
      alert("Failed to post comment");
    } finally {
      setCommentLoading(false);
    }
  };

  // Delete Comment Flow
  const handleDeleteComment = async (commentId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmed) return;

    try {
      await api.delete(`/tasks/${selectedTask?.id}/comments/${commentId}`);
      if (selectedTask) {
        await fetchComments(selectedTask.id);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete comment");
    }
  };

  const isProjectManager = (task: Task) => {
    if (!currentUser) return false;
    return currentUser.role === "ADMIN" || task.project.managerId === currentUser.id;
  };

  const getPriorityColor = (pri: string) => {
    switch (pri) {
      case "HIGH":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    }
  };

  // Status Columns
  const columns = [
    { id: "TODO", title: "To Do", color: "border-slate-800 bg-slate-900/10" },
    { id: "IN_PROGRESS", title: "In Progress", color: "border-blue-800 bg-blue-900/5" },
    { id: "COMPLETED", title: "Completed", color: "border-emerald-800 bg-emerald-900/5" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Loading Tasks Board...</p>
        </div>
      </div>
    );
  }

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
                Tasks Board
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Visual Kanban board tracking and comment discussions
              </p>
            </div>
            
            <button
              onClick={openCreateMode}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/10 transition-smooth flex items-center gap-2 text-sm cursor-pointer"
            >
              <span>+</span> Create Task
            </button>
          </div>

          {/* Kanban Board Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map((col) => {
              const columnTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className={`border rounded-2xl p-5 flex flex-col space-y-4 min-h-[500px] ${col.color}`}
                >
                  {/* Column Header */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <span className="font-extrabold text-sm text-slate-300">
                      {col.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-850 rounded-full text-slate-400 font-bold border border-slate-700/50">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Task list container */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[600px] custom-scroll">
                    {columnTasks.length > 0 ? (
                      columnTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => openTaskDetails(task)}
                          className="bg-slate-900 border border-slate-800/80 hover:border-slate-750 p-4 rounded-xl shadow-premium cursor-pointer transition-smooth space-y-4 hover:-translate-y-0.5"
                        >
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="font-extrabold text-sm text-slate-200 line-clamp-1">
                                {task.title}
                              </h4>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {task.description || "No task description provided."}
                            </p>
                          </div>

                          {/* Info chips */}
                          <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-[9px] font-bold text-slate-500">
                            <span className="truncate max-w-[120px]">
                              📂 {task.project.name}
                            </span>
                            <span className="truncate">
                              👤 {task.user ? task.user.name.split(" ")[0] : "Unassigned"}
                            </span>
                          </div>

                          {/* Quick Controls */}
                          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                            {col.id !== "TODO" && (
                              <button
                                onClick={() => handleUpdateStatus(task.id, col.id === "COMPLETED" ? "IN_PROGRESS" : "TODO")}
                                className="flex-1 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg text-[9px] font-bold transition-smooth cursor-pointer"
                              >
                                ◀ Move Back
                              </button>
                            )}
                            {col.id !== "COMPLETED" && (
                              <button
                                onClick={() => handleUpdateStatus(task.id, col.id === "TODO" ? "IN_PROGRESS" : "COMPLETED")}
                                className="flex-1 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/20 rounded-lg text-[9px] font-bold transition-smooth cursor-pointer"
                              >
                                {col.id === "TODO" ? "Start Task ▶" : "Complete Task ▶"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center text-center py-16 text-slate-600 text-xs border-2 border-slate-850 border-dashed rounded-xl">
                        No tasks in this board column
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Task Detail Modal with Comments */}
          {showDetailModal && selectedTask && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                
                {/* Left Side: Details & Actions */}
                <div className="flex-1 p-6 border-r border-slate-800 space-y-6 overflow-y-auto">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Task Details
                      </span>
                      <h3 className="text-xl font-extrabold text-white mt-1">
                        {selectedTask.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Project: <span className="font-semibold text-slate-300">{selectedTask.project.name}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isProjectManager(selectedTask) && (
                        <>
                          <button
                            onClick={() => {
                              openEditMode(selectedTask);
                              setShowDetailModal(false);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl border border-slate-700/50 transition-smooth cursor-pointer"
                            title="Edit Task"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteTask(selectedTask.id)}
                            className="bg-slate-800 hover:bg-rose-950 text-slate-350 hover:text-rose-400 p-2 rounded-xl border border-slate-700/50 transition-smooth cursor-pointer"
                            title="Delete Task"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Description
                    </h4>
                    <p className="text-sm text-slate-350 bg-slate-950/30 p-4 rounded-xl border border-slate-850 leading-relaxed">
                      {selectedTask.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-850 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">
                        Status
                      </span>
                      <select
                        className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg mt-1 font-semibold focus:outline-none w-full"
                        value={selectedTask.status}
                        onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">
                        Priority
                      </span>
                      <span className={`inline-block text-[10px] font-black px-2.5 py-1 rounded mt-1.5 uppercase ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">
                        Assigned To
                      </span>
                      <span className="block text-slate-300 font-bold mt-1.5">
                        👤 {selectedTask.user?.name || "Not assigned"}
                      </span>
                    </div>

                    {selectedTask.dueDate && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">
                          Due Date
                        </span>
                        <span className="block text-slate-300 font-semibold mt-1.5">
                          📅 {selectedTask.dueDate.substring(0, 10)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Comments pane */}
                <div className="w-full md:w-96 p-6 bg-slate-900/50 flex flex-col max-h-[85vh]">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <h4 className="font-extrabold text-sm text-slate-300">
                      Discussions ({comments.length})
                    </h4>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedTask(null);
                        setComments([]);
                      }}
                      className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Comments Feed */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-4 max-h-[350px] custom-scroll">
                    {comments.length > 0 ? (
                      comments.map((c) => (
                        <div key={c.id} className="space-y-1.5 text-xs bg-slate-950/20 p-3 rounded-xl border border-slate-850">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-blue-400">{c.user.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">{c.createdAt.substring(0, 10)}</span>
                              {(currentUser?.role === "ADMIN" || currentUser?.id === c.userId) && (
                                <button
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="text-slate-500 hover:text-rose-400 cursor-pointer"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-300 leading-normal">{c.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-500 text-xs">
                        No comment history yet. Type below to start discussion.
                      </div>
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3.5 py-2 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Discuss task status..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={commentLoading}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition-smooth cursor-pointer"
                    >
                      Post
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* Create/Edit Task Modal */}
          {showFormModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <form
                onSubmit={handleCreateOrUpdateTask}
                className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editMode ? "Edit Task" : "Create New Task"}
                  </h3>
                  <button
                    type="button"
                    onClick={clearForm}
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
                    Task Title
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-smooth"
                    placeholder="e.g. Implement API"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-smooth"
                    placeholder="Provide description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Assign Project
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={editMode} // project cannot be changed once task is created to keep relations intact
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Assign Member
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    disabled={!projectId}
                  >
                    <option value="">-- Unassigned --</option>
                    {eligibleAssignees.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {!projectId && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      * Select a project first to see eligible project members.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Priority
                    </label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-350 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Due Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={clearForm}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-smooth cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-smooth shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    {editMode ? "Save Changes" : "Save Task"}
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