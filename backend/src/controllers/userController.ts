import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../utils/prisma";

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Create a new user (Admin only)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password || "password123", 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "TEAM_MEMBER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Update user details / role (Admin only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role, password } = req.body;
    const userId = Number(req.params.id);

    const updateData: any = { name, email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const requesterId = (req as any).user?.id;

    if (userId === requesterId) {
      return res.status(400).json({
        message: "Cannot delete your own account",
      });
    }

    // 1. Delete comments by this user
    await prisma.comment.deleteMany({
      where: { userId },
    });

    // 2. Unassign tasks assigned to this user
    await prisma.task.updateMany({
      where: { assignedTo: userId },
      data: { assignedTo: null },
    });

    // 3. Delete project memberships of this user
    await prisma.projectMember.deleteMany({
      where: { userId },
    });

    // 4. Reassign managed projects to requester (admin)
    if (requesterId) {
      await prisma.project.updateMany({
        where: { managerId: userId },
        data: { managerId: requesterId },
      });
    }

    // 5. Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};