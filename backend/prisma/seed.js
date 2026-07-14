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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Seeding database...");
        // Clear existing data in reverse order of dependencies
        yield prisma.comment.deleteMany({});
        yield prisma.task.deleteMany({});
        yield prisma.projectMember.deleteMany({});
        yield prisma.project.deleteMany({});
        yield prisma.user.deleteMany({});
        // Hash passwords
        const adminPassword = yield bcrypt_1.default.hash("admin123", 10);
        const managerPassword = yield bcrypt_1.default.hash("manager123", 10);
        const member1Password = yield bcrypt_1.default.hash("member123", 10);
        const member2Password = yield bcrypt_1.default.hash("member222", 10);
        // Create Users
        const admin = yield prisma.user.create({
            data: {
                name: "John Admin",
                email: "admin@taskflow.com",
                password: adminPassword,
                role: client_1.Role.ADMIN,
            },
        });
        const manager = yield prisma.user.create({
            data: {
                name: "Sarah Manager",
                email: "manager@taskflow.com",
                password: managerPassword,
                role: client_1.Role.PROJECT_MANAGER,
            },
        });
        const member1 = yield prisma.user.create({
            data: {
                name: "Alex Developer",
                email: "member1@taskflow.com",
                password: member1Password,
                role: client_1.Role.TEAM_MEMBER,
            },
        });
        const member2 = yield prisma.user.create({
            data: {
                name: "Emily Designer",
                email: "member2@taskflow.com",
                password: member2Password,
                role: client_1.Role.TEAM_MEMBER,
            },
        });
        console.log("Created users:", {
            admin: admin.email,
            manager: manager.email,
            member1: member1.email,
            member2: member2.email,
        });
        // Create Project 1 managed by manager
        const project1 = yield prisma.project.create({
            data: {
                name: "TaskFlow Platform Redesign",
                description: "Overhaul the UI/UX design and migrate backend services to Node/Express with database scaling.",
                managerId: manager.id,
            },
        });
        // Create Project 2 managed by manager
        const project2 = yield prisma.project.create({
            data: {
                name: "Mobile App Development",
                description: "Build a cross-platform mobile app client using Flutter and GraphQL integration.",
                managerId: manager.id,
            },
        });
        // Add members to project 1
        yield prisma.projectMember.createMany({
            data: [
                { projectId: project1.id, userId: member1.id },
                { projectId: project1.id, userId: member2.id },
            ],
        });
        // Add member to project 2
        yield prisma.projectMember.createMany({
            data: [
                { projectId: project2.id, userId: member1.id },
            ],
        });
        console.log("Created projects and project members.");
        // Create Tasks for Project 1
        const task1 = yield prisma.task.create({
            data: {
                title: "Design Figma mockups",
                description: "Create interactive layout designs for taskboards, calendar views, and settings page.",
                status: client_1.TaskStatus.IN_PROGRESS,
                priority: client_1.Priority.HIGH,
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                projectId: project1.id,
                assignedTo: member2.id,
            },
        });
        const task2 = yield prisma.task.create({
            data: {
                title: "Setup database migrations & models",
                description: "Write schema.prisma, configure MySQL connection and seed the DB.",
                status: client_1.TaskStatus.COMPLETED,
                priority: client_1.Priority.MEDIUM,
                dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
                projectId: project1.id,
                assignedTo: member1.id,
            },
        });
        const task3 = yield prisma.task.create({
            data: {
                title: "Build RESTful APIs for Task Comments",
                description: "Create schema relationships, build comment routing and secure endpoints with RBAC.",
                status: client_1.TaskStatus.TODO,
                priority: client_1.Priority.HIGH,
                dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
                projectId: project1.id,
                assignedTo: member1.id,
            },
        });
        // Create Tasks for Project 2
        const task4 = yield prisma.task.create({
            data: {
                title: "Setup Flutter application skeleton",
                description: "Initialize Flutter app, add state management with Riverpod, and configure linter.",
                status: client_1.TaskStatus.TODO,
                priority: client_1.Priority.MEDIUM,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                projectId: project2.id,
                assignedTo: member1.id,
            },
        });
        console.log("Created tasks.");
        // Create Comments on task1
        yield prisma.comment.create({
            data: {
                content: "I have drafted the landing page. Working on task details panel tomorrow.",
                userId: member2.id,
                taskId: task1.id,
            },
        });
        yield prisma.comment.create({
            data: {
                content: "Awesome! Please ensure the color palette is in line with the brand guidelines.",
                userId: manager.id,
                taskId: task1.id,
            },
        });
        // Create Comment on task2
        yield prisma.comment.create({
            data: {
                content: "Seed script is working fine. Database migrations executed successfully.",
                userId: member1.id,
                taskId: task2.id,
            },
        });
        console.log("Created task comments.");
        console.log("Database seeded successfully! 🌱");
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
