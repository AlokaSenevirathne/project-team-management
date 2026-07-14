import { PrismaClient, Role, TaskStatus, Priority } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data in reverse order of dependencies
  await prisma.comment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const managerPassword = await bcrypt.hash("manager123", 10);
  const member1Password = await bcrypt.hash("member123", 10);
  const member2Password = await bcrypt.hash("member222", 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: "John Admin",
      email: "admin@taskflow.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Sarah Manager",
      email: "manager@taskflow.com",
      password: managerPassword,
      role: Role.PROJECT_MANAGER,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: "Alex Developer",
      email: "member1@taskflow.com",
      password: member1Password,
      role: Role.TEAM_MEMBER,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: "Emily Designer",
      email: "member2@taskflow.com",
      password: member2Password,
      role: Role.TEAM_MEMBER,
    },
  });

  console.log("Created users:", {
    admin: admin.email,
    manager: manager.email,
    member1: member1.email,
    member2: member2.email,
  });

  // Create Project 1 managed by manager
  const project1 = await prisma.project.create({
    data: {
      name: "TaskFlow Platform Redesign",
      description: "Overhaul the UI/UX design and migrate backend services to Node/Express with database scaling.",
      managerId: manager.id,
    },
  });

  // Create Project 2 managed by manager
  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App Development",
      description: "Build a cross-platform mobile app client using Flutter and GraphQL integration.",
      managerId: manager.id,
    },
  });

  // Add members to project 1
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: member1.id },
      { projectId: project1.id, userId: member2.id },
    ],
  });

  // Add member to project 2
  await prisma.projectMember.createMany({
    data: [
      { projectId: project2.id, userId: member1.id },
    ],
  });

  console.log("Created projects and project members.");

  // Create Tasks for Project 1
  const task1 = await prisma.task.create({
    data: {
      title: "Design Figma mockups",
      description: "Create interactive layout designs for taskboards, calendar views, and settings page.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      projectId: project1.id,
      assignedTo: member2.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Setup database migrations & models",
      description: "Write schema.prisma, configure MySQL connection and seed the DB.",
      status: TaskStatus.COMPLETED,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      projectId: project1.id,
      assignedTo: member1.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Build RESTful APIs for Task Comments",
      description: "Create schema relationships, build comment routing and secure endpoints with RBAC.",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      projectId: project1.id,
      assignedTo: member1.id,
    },
  });

  // Create Tasks for Project 2
  const task4 = await prisma.task.create({
    data: {
      title: "Setup Flutter application skeleton",
      description: "Initialize Flutter app, add state management with Riverpod, and configure linter.",
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      projectId: project2.id,
      assignedTo: member1.id,
    },
  });

  console.log("Created tasks.");

  // Create Comments on task1
  await prisma.comment.create({
    data: {
      content: "I have drafted the landing page. Working on task details panel tomorrow.",
      userId: member2.id,
      taskId: task1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Awesome! Please ensure the color palette is in line with the brand guidelines.",
      userId: manager.id,
      taskId: task1.id,
    },
  });

  // Create Comment on task2
  await prisma.comment.create({
    data: {
      content: "Seed script is working fine. Database migrations executed successfully.",
      userId: member1.id,
      taskId: task2.id,
    },
  });

  console.log("Created task comments.");
  console.log("Database seeded successfully! 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
