"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatus = exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Create Task (ADMIN or PROJECT_MANAGER only)
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, priority, dueDate, projectId, assignedTo } = req.body;
        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        // Check project existence & manager
        const project = yield prisma_1.default.project.findUnique({
            where: { id: Number(projectId) }
        });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        // Must be Admin or project's manager
        if (requesterRole !== "ADMIN" && project.managerId !== requesterId) {
            return res.status(403).json({ message: "Access denied. You do not manage this project." });
        }
        // Validate assigned user is a member of the project
        if (assignedTo) {
            const isMember = yield prisma_1.default.projectMember.findUnique({
                where: {
                    projectId_userId: {
                        projectId: Number(projectId),
                        userId: Number(assignedTo)
                    }
                }
            });
            if (!isMember && Number(assignedTo) !== project.managerId) {
                return res.status(400).json({
                    message: "Assigned user is not a member of this project"
                });
            }
        }
        const task = yield prisma_1.default.task.create({
            data: {
                title,
                description,
                priority: priority || "MEDIUM",
                dueDate: dueDate ? new Date(dueDate) : null,
                projectId: Number(projectId),
                assignedTo: assignedTo ? Number(assignedTo) : null
            },
            include: {
                project: true,
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
        res.status(201).json({
            message: "Task created successfully",
            task
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createTask = createTask;
// Get Tasks (role-based filter)
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const projectIdQuery = req.query.projectId ? Number(req.query.projectId) : undefined;
        let whereClause = {};
        // If specific projectId requested, apply it
        if (projectIdQuery) {
            whereClause.projectId = projectIdQuery;
        }
        if (userRole === "PROJECT_MANAGER") {
            // Can see tasks in projects they manage OR tasks assigned to them OR projects they are member of
            whereClause.OR = [
                { project: { managerId: userId } },
                { assignedTo: userId },
                { project: { members: { some: { userId } } } }
            ];
        }
        else if (userRole === "TEAM_MEMBER") {
            // Can see tasks in projects they are member of OR tasks assigned to them OR projects they manage
            whereClause.OR = [
                { project: { members: { some: { userId } } } },
                { assignedTo: userId },
                { project: { managerId: userId } }
            ];
        }
        const tasks = yield prisma_1.default.task.findMany({
            where: whereClause,
            include: {
                project: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });
        res.json(tasks);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getTasks = getTasks;
// Get Single Task (Role protected)
const getTaskById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = Number(req.params.id);
        const userId = req.user.id;
        const userRole = req.user.role;
        const task = yield prisma_1.default.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    include: {
                        members: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Access check: Admin, Project Manager (of project), Assignee, or project member
        if (userRole !== "ADMIN" && task.project.managerId !== userId && task.assignedTo !== userId) {
            const isMember = task.project.members.some(m => m.userId === userId);
            if (!isMember) {
                return res.status(403).json({ message: "Access denied" });
            }
        }
        // Clean project members from response to avoid bloating
        const _a = task.project, { members } = _a, projectDetails = __rest(_a, ["members"]);
        const taskResponse = Object.assign(Object.assign({}, task), { project: projectDetails });
        res.json(taskResponse);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getTaskById = getTaskById;
// Update Task (Admin or Project Manager of project)
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, priority, dueDate, assignedTo } = req.body;
        const taskId = Number(req.params.id);
        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        const task = yield prisma_1.default.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Check permission: Admin or Project Manager of this project
        if (requesterRole !== "ADMIN" && task.project.managerId !== requesterId) {
            return res.status(403).json({ message: "Access denied. You do not manage this project." });
        }
        // Validate assigned user is a member of the project
        if (assignedTo) {
            const isMember = yield prisma_1.default.projectMember.findUnique({
                where: {
                    projectId_userId: {
                        projectId: task.projectId,
                        userId: Number(assignedTo)
                    }
                }
            });
            if (!isMember && Number(assignedTo) !== task.project.managerId) {
                return res.status(400).json({
                    message: "Assigned user is not a member of this project"
                });
            }
        }
        const updated = yield prisma_1.default.task.update({
            where: { id: taskId },
            data: {
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
                assignedTo: assignedTo ? Number(assignedTo) : null
            },
            include: {
                project: true,
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        res.json({
            message: "Task updated successfully",
            task: updated
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateTask = updateTask;
// Delete Task (Admin or Project Manager of project)
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = Number(req.params.id);
        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        const task = yield prisma_1.default.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Admin or Manager of project
        if (requesterRole !== "ADMIN" && task.project.managerId !== requesterId) {
            return res.status(403).json({ message: "Access denied" });
        }
        // Delete dependencies first
        yield prisma_1.default.comment.deleteMany({
            where: { taskId }
        });
        yield prisma_1.default.task.delete({
            where: { id: taskId }
        });
        res.json({
            message: "Task deleted successfully"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.deleteTask = deleteTask;
// Update Task Status (Admin, Manager of project, or assigned Team Member)
const updateTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const taskId = Number(req.params.id);
        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        const task = yield prisma_1.default.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Check permission: Admin OR project manager OR assigned user
        if (requesterRole !== "ADMIN" &&
            task.project.managerId !== requesterId &&
            task.assignedTo !== requesterId) {
            return res.status(403).json({
                message: "Access denied. You are not authorized to update status for this task."
            });
        }
        const updated = yield prisma_1.default.task.update({
            where: { id: taskId },
            data: { status }
        });
        res.json({
            message: "Task status updated successfully",
            task: updated
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateTaskStatus = updateTaskStatus;
