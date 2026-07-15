import request from "supertest";
import { app } from "../server";
import prisma from "../utils/prisma";

describe("Authentication endpoints", () => {
  const testUser = {
    name: "Test Developer",
    email: "test_dev_999@taskflow.com",
    password: "testpassword123",
    role: "TEAM_MEMBER",
  };

  let token = "";

  // Cleanup before and after tests
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  it("should successfully register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", testUser.email);
    expect(res.body.user).toHaveProperty("role", testUser.role);
  });

  it("should fail to register an existing user email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "User already exists");
  });

  it("should successfully log in the registered user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  it("should retrieve own profile details using getMe endpoint", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("email", testUser.email);
    expect(res.body).toHaveProperty("name", testUser.name);
    expect(res.body).toHaveProperty("role", testUser.role);
  });

  it("should block profile retrieval if token is missing", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
