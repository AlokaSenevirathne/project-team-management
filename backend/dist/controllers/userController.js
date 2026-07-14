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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../utils/prisma"));
// Get all users
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
});
exports.getUsers = getUsers;
// Create a new user (Admin only)
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists",
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password || "password123", 10);
        const user = yield prisma_1.default.user.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
});
exports.createUser = createUser;
// Update user details / role (Admin only)
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, role, password } = req.body;
        const userId = Number(req.params.id);
        const updateData = { name, email, role };
        if (password) {
            updateData.password = yield bcrypt_1.default.hash(password, 10);
        }
        const user = yield prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
});
exports.updateUser = updateUser;
// Delete user (Admin only)
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number(req.params.id);
        const requesterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (userId === requesterId) {
            return res.status(400).json({
                message: "Cannot delete your own account",
            });
        }
        // 1. Delete comments by this user
        yield prisma_1.default.comment.deleteMany({
            where: { userId },
        });
        // 2. Unassign tasks assigned to this user
        yield prisma_1.default.task.updateMany({
            where: { assignedTo: userId },
            data: { assignedTo: null },
        });
        // 3. Delete project memberships of this user
        yield prisma_1.default.projectMember.deleteMany({
            where: { userId },
        });
        // 4. Reassign managed projects to requester (admin)
        if (requesterId) {
            yield prisma_1.default.project.updateMany({
                where: { managerId: userId },
                data: { managerId: requesterId },
            });
        }
        // 5. Delete user
        yield prisma_1.default.user.delete({
            where: { id: userId },
        });
        res.json({
            message: "User deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
});
exports.deleteUser = deleteUser;
