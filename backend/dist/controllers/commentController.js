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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.createComment = exports.getCommentsByTaskId = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Get comments for a task
const getCommentsByTaskId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = Number(req.params.taskId);
        const userId = req.user.id;
        const userRole = req.user.role;
        // Check if task exists and user has access
        const task = yield prisma_1.default.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    include: { members: true }
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
                return res.status(403).json({ message: "Access denied. You are not a member of this project." });
            }
        }
        const comments = yield prisma_1.default.comment.findMany({
            where: { taskId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        res.json(comments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getCommentsByTaskId = getCommentsByTaskId;
// Create a comment
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = Number(req.params.taskId);
        const { content } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Comment content cannot be empty" });
        }
        // Check if task exists and user has access
        const task = yield prisma_1.default.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    include: { members: true }
                }
            }
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Access check
        if (userRole !== "ADMIN" && task.project.managerId !== userId && task.assignedTo !== userId) {
            const isMember = task.project.members.some(m => m.userId === userId);
            if (!isMember) {
                return res.status(403).json({ message: "Access denied" });
            }
        }
        const comment = yield prisma_1.default.comment.create({
            data: {
                content,
                taskId,
                userId
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
        res.status(201).json({
            message: "Comment added successfully",
            comment
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createComment = createComment;
// Delete a comment
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commentId = Number(req.params.id);
        const userId = req.user.id;
        const userRole = req.user.role;
        const comment = yield prisma_1.default.comment.findUnique({
            where: { id: commentId },
            include: {
                task: {
                    include: { project: true }
                }
            }
        });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        // Access check: only comment author, project manager, or Admin can delete comments
        if (userRole !== "ADMIN" &&
            comment.userId !== userId &&
            comment.task.project.managerId !== userId) {
            return res.status(403).json({ message: "Access denied. You are not authorized to delete this comment." });
        }
        yield prisma_1.default.comment.delete({
            where: { id: commentId }
        });
        res.json({ message: "Comment deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.deleteComment = deleteComment;
