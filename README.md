# Project and Team Task Management Platform

This is a comprehensive, multi-role project and task management platform featuring stateless JWT authentication, secure role-based access control (RBAC), and a responsive glassmorphic Kanban interface.

## Tech Stack

* **Frontend**: Next.js (App Router, React 19) styled with TailwindCSS.
* **Backend**: Node.js + Express.js in TypeScript.
* **Database**: MySQL managed with Prisma ORM.
* **CI/CD**: GitHub Actions workflows for build validation and integration tests.
* **Testing**: Jest and Supertest.

---

## Documentation & Diagrams

We have prepared detailed documentation and diagrams inside the `docs/` folder:
1. **[Entity Relationship Diagram (ERD)](file:///docs/erd.md)**: Details models, fields, types, and database relationships.
2. **[Use Case Diagram](file:///docs/use_cases.md)**: Highlights user stories, actions, and the RBAC permission matrix.
3. **[System Architecture Diagram](file:///docs/architecture.md)**: Maps out Client, Application, and Database tiers.
4. **[RESTful API Documentation](file:///docs/api.md)**: Provides a comprehensive endpoint reference with input parameters and return payloads.
5. **[Feature Completion Report](file:///docs/features.md)**: Details the completed features by role (Admin, PM, Team Member).
6. **[CI/CD Workflow Explanation](file:///docs/cicd.md)**: Explains the build verification and automated testing pipeline.

---

## Seeded Accounts for Testing

After seeding the database (instructions below), you can log in with the following preset accounts:

| Role | Email | Password | Allowed Capabilities |
|:---|:---|:---|:---|
| **Administrator** | `admin@taskflow.com` | `admin123` | Full access to users, projects, tasks, and system overrides |
| **Project Manager** | `manager@taskflow.com` | `manager123` | Create projects, assign members, and manage project tasks |
| **Team Member 1** | `member1@taskflow.com` | `member123` | View assigned projects/tasks, update status, comment |
| **Team Member 2** | `member2@taskflow.com` | `member222` | View assigned projects/tasks, update status, comment |

---

## Installation & Setup Instructions

### 1. Database Setup

1. Make sure you have a running MySQL server.
2. Log in to your MySQL command line or GUI client (like phpMyAdmin or DBeaver) and create a database named `project_management`:
   ```sql
   CREATE DATABASE project_management;
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```
   Modify `DATABASE_URL` inside `.env` to match your MySQL connection string, for example:
   ```env
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/project_management"
   JWT_SECRET="myProjectManagementSecret123"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed the database with the test accounts and sample tasks:
   ```bash
   npx prisma db seed
   ```
6. Start the development backend server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`.

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Verify that `NEXT_PUBLIC_API_URL` points to `http://localhost:5000/api`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the frontend client:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

### 4. Running Backend Tests

To run the automated integration tests locally:
```bash
cd backend
npm run test
```

---

## AI Assistance Statement

During the development of this project, AI assistance (specifically Google Antigravity) was used for:
* Building the initial Next.js layout structures and crafting the premium glassmorphic UI using TailwindCSS.
* Designing the database schemas and relationships using Prisma ORM.
* Establishing unit and integration tests using Jest and Supertest.
* Formulating the markdown files and mapping out the diagrams using Mermaid notation.
