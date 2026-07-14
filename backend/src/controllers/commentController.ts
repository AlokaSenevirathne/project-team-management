import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// Get comments for a task
export const getCommentsByTaskId = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const taskId = Number(req.params.taskId);
        const userId = req.user!.id;
        const userRole = req.user!.role;

        // Check if task exists and user has access
        const task = await prisma.task.findUnique({
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

        const comments = await prisma.comment.findMany({
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

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Create a comment
export const createComment = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const taskId = Number(req.params.taskId);
        const { content } = req.body;
        const userId = req.user!.id;
        const userRole = req.user!.role;

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Comment content cannot be empty" });
        }

        // Check if task exists and user has access
        const task = await prisma.task.findUnique({
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

        const comment = await prisma.comment.create({
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

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a comment
export const deleteComment = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const commentId = Number(req.params.id);
        const userId = req.user!.id;
        const userRole = req.user!.role;

        const comment = await prisma.comment.findUnique({
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
        if (
            userRole !== "ADMIN" &&
            comment.userId !== userId &&
            comment.task.project.managerId !== userId
        ) {
            return res.status(403).json({ message: "Access denied. You are not authorized to delete this comment." });
        }

        await prisma.comment.delete({
            where: { id: commentId }
        });

        res.json({ message: "Comment deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
