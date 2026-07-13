import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const createTask = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const {
            title,
            description,
            priority,
            dueDate,
            projectId,
            assignedTo
        } = req.body;

        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
                projectId,
                assignedTo
            }
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};
export const getTasks = async (
    req: AuthRequest,
    res: Response
) => {

    try {

      const tasks = await prisma.task.findMany({
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

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};
export const getTaskById = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const task = await prisma.task.findUnique({
            where: {
                id: Number(req.params.id)
            },
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

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(task);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};
export const updateTask = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo
        } = req.body;

        const task = await prisma.task.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
                assignedTo
            }
        });

        res.json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};
export const deleteTask = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        await prisma.task.delete({
            where: {
                id: Number(req.params.id)
            }
        });

        res.json({
            message: "Task deleted successfully"
        });

    } catch(error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};
export const updateTaskStatus = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const { status } = req.body;

        const task = await prisma.task.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                status
            }
        });


        res.json({
            message: "Task status updated successfully",
            task
        });


    } catch(error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};