import request from "supertest";
import { app } from "../server";
import prisma from "../utils/prisma";
import bcrypt from "bcrypt";

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

  beforeAll(async () => {
    // Delete any residues
    const emails = [testUsers.admin.email, testUsers.pm.email, testUsers.member.email];
    await prisma.comment.deleteMany({ where: { user: { email: { in: emails } } } });
    await prisma.task.deleteMany({ where: { project: { manager: { email: { in: emails } } } } });
    await prisma.projectMember.deleteMany({ where: { user: { email: { in: emails } } } });
    await prisma.project.deleteMany({ where: { manager: { email: { in: emails } } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });

    // Hash password
    const hashedPassword = await bcrypt.hash("testpassword123", 10);

    // Create Users
    const admin = await prisma.user.create({
      data: { ...testUsers.admin, password: hashedPassword }
    });
    adminId = admin.id;

    const pm = await prisma.user.create({
      data: { ...testUsers.pm, password: hashedPassword }
    });
    pmId = pm.id;

    const member = await prisma.user.create({
      data: { ...testUsers.member, password: hashedPassword }
    });
    memberId = member.id;

    // Login each to acquire tokens
    const adminLogin = await request(app).post("/api/auth/login").send({ email: testUsers.admin.email, password: "testpassword123" });
    adminToken = adminLogin.body.token;

    const pmLogin = await request(app).post("/api/auth/login").send({ email: testUsers.pm.email, password: "testpassword123" });
    pmToken = pmLogin.body.token;

    const memberLogin = await request(app).post("/api/auth/login").send({ email: testUsers.member.email, password: "testpassword123" });
    memberToken = memberLogin.body.token;
  });

  afterAll(async () => {
    const emails = [testUsers.admin.email, testUsers.pm.email, testUsers.member.email];
    // Delete test project and members
    if (createdProjectId) {
      await prisma.projectMember.deleteMany({ where: { projectId: createdProjectId } });
      await prisma.project.deleteMany({ where: { id: createdProjectId } });
    }
    // Delete users
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    await prisma.$disconnect();
  });

  it("should allow a Project Manager to create a project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${pmToken}`)
      .send({
        name: "Test PM Project",
        description: "Created by PM for integration testing"
      });

    expect(res.status).toBe(201);
    expect(res.body.project).toHaveProperty("name", "Test PM Project");
    createdProjectId = res.body.project.id;
  });

  it("should prevent a Team Member from creating a project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        name: "Restricted Project",
        description: "Should fail to create"
      });

    expect(res.status).toBe(403);
  });

  it("should prevent a Team Member from viewing project details before being added", async () => {
    const res = await request(app)
      .get(`/api/projects/${createdProjectId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });

  it("should allow Project Manager to add the Team Member to the project", async () => {
    const res = await request(app)
      .post(`/api/projects/${createdProjectId}/members`)
      .set("Authorization", `Bearer ${pmToken}`)
      .send({
        userId: memberId
      });

    expect(res.status).toBe(201);
    expect(res.body.member).toHaveProperty("userId", memberId);
  });

  it("should allow Team Member to view project details now that they are a member", async () => {
    const res = await request(app)
      .get(`/api/projects/${createdProjectId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", createdProjectId);
    expect(res.body.members[0]).toHaveProperty("userId", memberId);
  });
});
