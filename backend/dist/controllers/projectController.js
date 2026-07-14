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
exports.removeMember = exports.addMember = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Create Project (ADMIN or PROJECT_MANAGER only)
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const project = yield prisma_1.default.project.create({
            data: {
                name,
                description,
                managerId: req.user.id
            }
        });
        res.status(201).json({
            message: "Project created successfully",
            project
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});
exports.createProject = createProject;
// Get All Projects (Filtered based on roles)
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let projects;
        if (userRole === "ADMIN") {
            projects = yield prisma_1.default.project.findMany({
                include: {
                    manager: {
                        select: { id: true, name: true, email: true, role: true }
                    },
                    tasks: true,
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, role: true }
                            }
                        }
                    }
                }
            });
        }
        else if (userRole === "PROJECT_MANAGER") {
            projects = yield prisma_1.default.project.findMany({
                where: {
                    OR: [
                        { managerId: userId },
                        { members: { some: { userId } } }
                    ]
                },
                include: {
                    manager: {
                        select: { id: true, name: true, email: true, role: true }
                    },
                    tasks: true,
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, role: true }
                            }
                        }
                    }
                }
            });
        }
        else {
            projects = yield prisma_1.default.project.findMany({
                where: {
                    members: { some: { userId } }
                },
                include: {
                    manager: {
                        select: { id: true, name: true, email: true, role: true }
                    },
                    tasks: true,
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, role: true }
                            }
                        }
                    }
                }
            });
        }
        res.json(projects);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});
exports.getProjects = getProjects;
// Get Single Project (Role/Member protected)
const getProjectById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = Number(req.params.id);
        const userId = req.user.id;
        const userRole = req.user.role;
        const project = yield prisma_1.default.project.findUnique({
            where: {
                id: projectId
            },
            include: {
                manager: {
                    select: { id: true, name: true, email: true, role: true }
                },
                tasks: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, role: true }
                        }
                    }
                }
            }
        });
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }
        // Access check
        if (userRole !== "ADMIN" && project.managerId !== userId) {
            const isMember = project.members.some(m => m.userId === userId);
            if (!isMember) {
                return res.status(403).json({
                    message: "Access denied. You are not a member of this project."
                });
            }
        }
        res.json(project);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});
exports.getProjectById = getProjectById;
// Update Project (Only manager or Admin)
const updateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const projectId = Number(req.params.id);
        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        const project = yield prisma_1.default.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }
        if (requesterRole !== "ADMIN" && project.managerId !== requesterId) {
            return res.status(403).json({
                message: "Access denied. You do not manage this project."
            });
        }
        const updated = yield prisma_1.default.project.update({
            where: {
                id: projectId
            },
            data: {
                name,
                description
            }
        });
        res.json({
            message: "Project updated successfully",
            project: updated
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});
exports.updateProject = updateProject;
// Delete Project (Admin only)
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = Number(req.params.id);
        // Delete dependencies first
        yield prisma_1.default.comment.deleteMany({
            where: { task: { projectId } }
        });
        yield prisma_1.default.task.deleteMany({
            where: { projectId }
        });
        yield prisma_1.default.projectMember.deleteMany({
            where: { projectId }
        });
        yield prisma_1.default.project.delete({
            where: {
                id: projectId
            }
        });
        res.json({
            message: "Project deleted successfully"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});
exports.deleteProject = deleteProject;
// Add Member (Admin or Project Manager)
const addMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const projectId = Number(req.params.projectId);
        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        const project = yield prisma_1.default.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }
        if (requesterRole !== "ADMIN" && project.managerId !== requesterId) {
            return res.status(403).json({
                message: "Access denied. You do not manage this project."
            });
        }
        // Check if already a member
        const existingMember = yield prisma_1.default.projectMember.findUnique({
            where: {
                projectId_userId: { projectId, userId }
            }
        });
        if (existingMember) {
            return res.status(400).json({
                message: "User is already a member of this project"
            });
        }
        const member = yield prisma_1.default.projectMember.create({
            data: {
                projectId,
                userId
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
        res.status(201).json({
            message: "Member added successfully",
            member
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});
exports.addMember = addMember;
// Remove Member (Admin or Project Manager)
const removeMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = Number(req.params.projectId);
        const userId = Number(req.params.userId);
        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        const project = yield prisma_1.default.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }
        if (requesterRole !== "ADMIN" && project.managerId !== requesterId) {
            return res.status(403).json({
                message: "Access denied. You do not manage this project."
            });
        }
        yield prisma_1.default.projectMember.delete({
            where: {
                projectId_userId: { projectId, userId }
            }
        });
        // Unassign any tasks in this project assigned to this user
        yield prisma_1.default.task.updateMany({
            where: {
                projectId,
                assignedTo: userId
            },
            data: {
                assignedTo: null
            }
        });
        res.json({
            message: "Member removed successfully"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});
exports.removeMember = removeMember;
