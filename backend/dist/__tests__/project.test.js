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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
const prisma_1 = __importDefault(require("../utils/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
describe("Project and RBAC endpoints", () => {
    let adminToken = "";
    let pmToken = "";
    let memberToken = "";
    let adminId = 0;
    let pmId = 0;
    let memberId = 0;
    let createdProjectId = 0;
    const testUsers = {
        admin: { name: "Test Admin", email: "admin_test_999@taskflow.com", password: "adminpassword", role: "ADMIN" },
        pm: { name: "Test PM", email: "pm_test_999@taskflow.com", password: "pmpassword", role: "PROJECT_MANAGER" },
        member: { name: "Test Member", email: "member_test_999@taskflow.com", password: "memberpassword", role: "TEAM_MEMBER" },
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Delete any residues
        const emails = [testUsers.admin.email, testUsers.pm.email, testUsers.member.email];
        yield prisma_1.default.comment.deleteMany({ where: { user: { email: { in: emails } } } });
        yield prisma_1.default.task.deleteMany({ where: { project: { manager: { email: { in: emails } } } } });
        yield prisma_1.default.projectMember.deleteMany({ where: { user: { email: { in: emails } } } });
        yield prisma_1.default.project.deleteMany({ where: { manager: { email: { in: emails } } } });
        yield prisma_1.default.user.deleteMany({ where: { email: { in: emails } } });
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash("testpassword123", 10);
        // Create Users
        const admin = yield prisma_1.default.user.create({
            data: Object.assign(Object.assign({}, testUsers.admin), { password: hashedPassword })
        });
        adminId = admin.id;
        const pm = yield prisma_1.default.user.create({
            data: Object.assign(Object.assign({}, testUsers.pm), { password: hashedPassword })
        });
        pmId = pm.id;
        const member = yield prisma_1.default.user.create({
            data: Object.assign(Object.assign({}, testUsers.member), { password: hashedPassword })
        });
        memberId = member.id;
        // Login each to acquire tokens
        const adminLogin = yield (0, supertest_1.default)(server_1.app).post("/api/auth/login").send({ email: testUsers.admin.email, password: "testpassword123" });
        adminToken = adminLogin.body.token;
        const pmLogin = yield (0, supertest_1.default)(server_1.app).post("/api/auth/login").send({ email: testUsers.pm.email, password: "testpassword123" });
        pmToken = pmLogin.body.token;
        const memberLogin = yield (0, supertest_1.default)(server_1.app).post("/api/auth/login").send({ email: testUsers.member.email, password: "testpassword123" });
        memberToken = memberLogin.body.token;
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const emails = [testUsers.admin.email, testUsers.pm.email, testUsers.member.email];
        // Delete test project and members
        if (createdProjectId) {
            yield prisma_1.default.projectMember.deleteMany({ where: { projectId: createdProjectId } });
            yield prisma_1.default.project.deleteMany({ where: { id: createdProjectId } });
        }
        // Delete users
        yield prisma_1.default.user.deleteMany({ where: { email: { in: emails } } });
        yield prisma_1.default.$disconnect();
    }));
    it("should allow a Project Manager to create a project", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${pmToken}`)
            .send({
            name: "Test PM Project",
            description: "Created by PM for integration testing"
        });
        expect(res.status).toBe(201);
        expect(res.body.project).toHaveProperty("name", "Test PM Project");
        createdProjectId = res.body.project.id;
    }));
    it("should prevent a Team Member from creating a project", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${memberToken}`)
            .send({
            name: "Restricted Project",
            description: "Should fail to create"
        });
        expect(res.status).toBe(403);
    }));
    it("should prevent a Team Member from viewing project details before being added", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.app)
            .get(`/api/projects/${createdProjectId}`)
            .set("Authorization", `Bearer ${memberToken}`);
        expect(res.status).toBe(403);
    }));
    it("should allow Project Manager to add the Team Member to the project", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.app)
            .post(`/api/projects/${createdProjectId}/members`)
            .set("Authorization", `Bearer ${pmToken}`)
            .send({
            userId: memberId
        });
        expect(res.status).toBe(201);
        expect(res.body.member).toHaveProperty("userId", memberId);
    }));
    it("should allow Team Member to view project details now that they are a member", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.app)
            .get(`/api/projects/${createdProjectId}`)
            .set("Authorization", `Bearer ${memberToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id", createdProjectId);
        expect(res.body.members[0]).toHaveProperty("userId", memberId);
    }));
});
