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
describe("Authentication endpoints", () => {
    const testUser = {
        name: "Test Developer",
        email: "test_dev_999@taskflow.com",
        password: "testpassword123",
        role: "TEAM_MEMBER",
    };
    let token = "";
    // Cleanup before and after tests
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma_1.default.user.deleteMany({
            where: { email: testUser.email },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma_1.default.user.deleteMany({
            where: { email: testUser.email },
        });
        yield prisma_1.default.$disconnect();
    }));
    it("should successfully register a new user", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.app)
            .post("/api/auth/register")
            .send(testUser);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user).toHaveProperty("email", testUser.email);
        expect(res.body.user).toHaveProperty("role", testUser.role);
    }));
    it("should fail to register an existing user email", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.app)
            .post("/api/auth/register")
            .send(testUser);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("message", "User already exists");
    }));
    it("should successfully log in the registered user", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.app)
            .post("/api/auth/login")
            .send({
            email: testUser.email,
            password: testUser.password,
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        token = res.body.token;
    }));
    it("should retrieve own profile details using getMe endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("email", testUser.email);
        expect(res.body).toHaveProperty("name", testUser.name);
        expect(res.body).toHaveProperty("role", testUser.role);
    }));
    it("should block profile retrieval if token is missing", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(server_1.app).get("/api/auth/me");
        expect(res.status).toBe(401);
    }));
});
