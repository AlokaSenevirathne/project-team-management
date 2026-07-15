# RESTful API Documentation

All request and response bodies use the `application/json` content type. Protected routes require the header `Authorization: Bearer <TOKEN>`.

---

## Authentication Endpoints

### 1. Register User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Auth Required**: No (Public)
* **Request Body**:
  ```json
  {
    "name": "Alex Developer",
    "email": "member1@taskflow.com",
    "password": "member1Password",
    "role": "TEAM_MEMBER"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "User created successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 3,
      "name": "Alex Developer",
      "email": "member1@taskflow.com",
      "role": "TEAM_MEMBER"
    }
  }
  ```

### 2. Login User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Auth Required**: No (Public)
* **Request Body**:
  ```json
  {
    "email": "member1@taskflow.com",
    "password": "member1Password"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 3,
      "name": "Alex Developer",
      "email": "member1@taskflow.com",
      "role": "TEAM_MEMBER"
    }
  }
  ```

### 3. Get Current User Profile
* **URL**: `/api/auth/me`
* **Method**: `GET`
* **Auth Required**: Yes (All Roles)
* **Success Response (200 OK)**:
  ```json
  {
    "id": 3,
    "name": "Alex Developer",
    "email": "member1@taskflow.com",
    "role": "TEAM_MEMBER",
    "createdAt": "2026-07-14T17:03:51.000Z"
  }
  ```

---

## User Management Endpoints

### 1. List All Users
* **URL**: `/api/users`
* **Method**: `GET`
* **Auth Required**: Yes (`ADMIN`, `PROJECT_MANAGER`)
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "John Admin",
      "email": "admin@taskflow.com",
      "role": "ADMIN",
      "createdAt": "2026-07-14T17:03:51.000Z"
    }
  ]
  ```

### 2. Create User
* **URL**: `/api/users`
* **Method**: `POST`
* **Auth Required**: Yes (`ADMIN` only)
* **Request Body**:
  ```json
  {
    "name": "Jane PM",
    "email": "jane@taskflow.com",
    "password": "password123",
    "role": "PROJECT_MANAGER"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "User created successfully",
    "user": {
      "id": 5,
      "name": "Jane PM",
      "email": "jane@taskflow.com",
      "role": "PROJECT_MANAGER",
      "createdAt": "2026-07-14T17:08:00.000Z"
    }
  }
  ```

### 3. Update User details & Role
* **URL**: `/api/users/:id`
* **Method**: `PUT`
* **Auth Required**: Yes (`ADMIN` only)
* **Request Body**:
  ```json
  {
    "name": "Jane PM Updated",
    "email": "jane@taskflow.com",
    "role": "ADMIN"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "User updated successfully",
    "user": {
      "id": 5,
      "name": "Jane PM Updated",
      "email": "jane@taskflow.com",
      "role": "ADMIN",
      "createdAt": "2026-07-14T17:08:00.000Z"
    }
  }
  ```

### 4. Delete User
* **URL**: `/api/users/:id`
* **Method**: `DELETE`
* **Auth Required**: Yes (`ADMIN` only)
* **Success Response (200 OK)**:
  ```json
  {
    "message": "User deleted successfully"
  }
  ```

---

## Project Endpoints

### 1. List Projects (Filtered)
* **URL**: `/api/projects`
* **Method**: `GET`
* **Auth Required**: Yes (All Roles)
  * *Note: Admins see all projects. Project Managers see projects they manage or are member of. Team Members only see projects they are assigned to.*
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "TaskFlow Redesign",
      "description": "UI Overhaul",
      "createdAt": "2026-07-14T17:03:51.000Z",
      "managerId": 2,
      "manager": { "id": 2, "name": "Sarah Manager", "email": "manager@taskflow.com" },
      "tasks": [],
      "members": []
    }
  ]
  ```

### 2. Create Project
* **URL**: `/api/projects`
* **Method**: `POST`
* **Auth Required**: Yes (`ADMIN`, `PROJECT_MANAGER`)
* **Request Body**:
  ```json
  {
    "name": "Billing Integration",
    "description": "Stripe Gateway Integration"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "Project created successfully",
    "project": {
      "id": 3,
      "name": "Billing Integration",
      "description": "Stripe Gateway Integration",
      "managerId": 2,
      "createdAt": "2026-07-14T17:09:00.000Z"
    }
  }
  ```

### 3. Add Project Member
* **URL**: `/api/projects/:projectId/members`
* **Method**: `POST`
* **Auth Required**: Yes (`ADMIN` or Project's manager)
* **Request Body**:
  ```json
  {
    "userId": 3
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "Member added successfully",
    "member": {
      "id": 4,
      "projectId": 3,
      "userId": 3,
      "user": { "id": 3, "name": "Alex Developer", "email": "member1@taskflow.com", "role": "TEAM_MEMBER" }
    }
  }
  ```

### 4. Remove Project Member
* **URL**: `/api/projects/:projectId/members/:userId`
* **Method**: `DELETE`
* **Auth Required**: Yes (`ADMIN` or Project's manager)
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Member removed successfully"
  }
  ```

### 5. Delete Project
* **URL**: `/api/projects/:id`
* **Method**: `DELETE`
* **Auth Required**: Yes (`ADMIN` only)
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Project deleted successfully"
  }
  ```

---

## Task Endpoints

### 1. List Tasks (Filtered)
* **URL**: `/api/tasks?projectId=1`
* **Method**: `GET`
* **Auth Required**: Yes (All Roles)
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "title": "Design Figma Mockups",
      "description": "UI UX specs",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2026-07-19T00:00:00.000Z",
      "projectId": 1,
      "assignedTo": 4,
      "project": { "id": 1, "name": "TaskFlow Redesign", "managerId": 2 },
      "user": { "id": 4, "name": "Emily Designer" }
    }
  ]
  ```

### 2. Create Task
* **URL**: `/api/tasks`
* **Method**: `POST`
* **Auth Required**: Yes (`ADMIN` or Project's manager)
* **Request Body**:
  ```json
  {
    "title": "Implement JWT middleware",
    "description": "Verify token claims and inject req.user",
    "priority": "HIGH",
    "dueDate": "2026-07-22T00:00:00.000Z",
    "projectId": 1,
    "assignedTo": 3
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "Task created successfully",
    "task": {
      "id": 5,
      "title": "Implement JWT middleware",
      "description": "Verify token claims and inject req.user",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2026-07-22T00:00:00.000Z",
      "projectId": 1,
      "assignedTo": 3
    }
  }
  ```

### 3. Update Task Status
* **URL**: `/api/tasks/:id/status`
* **Method**: `PUT`
* **Auth Required**: Yes (`ADMIN`, Project's manager, or Task's assignee)
* **Request Body**:
  ```json
  {
    "status": "COMPLETED"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Task status updated successfully",
    "task": {
      "id": 5,
      "status": "COMPLETED"
    }
  }
  ```

---

## Discussion / Comments Endpoints

### 1. List Task Comments
* **URL**: `/api/tasks/:taskId/comments`
* **Method**: `GET`
* **Auth Required**: Yes (Project Members / Manager / Admin)
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "content": "I have uploaded the layouts in Figma.",
      "createdAt": "2026-07-14T17:03:51.000Z",
      "taskId": 1,
      "userId": 4,
      "user": { "id": 4, "name": "Emily Designer", "email": "member2@taskflow.com", "role": "TEAM_MEMBER" }
    }
  ]
  ```

### 2. Create Comment
* **URL**: `/api/tasks/:taskId/comments`
* **Method**: `POST`
* **Auth Required**: Yes (Project Members / Manager / Admin)
* **Request Body**:
  ```json
  {
    "content": "Will review the layouts today!"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "message": "Comment added successfully",
    "comment": {
      "id": 4,
      "content": "Will review the layouts today!",
      "createdAt": "2026-07-14T17:10:00.000Z",
      "taskId": 1,
      "userId": 2,
      "user": { "id": 2, "name": "Sarah Manager", "email": "manager@taskflow.com", "role": "PROJECT_MANAGER" }
    }
  }
  ```

### 3. Delete Comment
* **URL**: `/api/tasks/:taskId/comments/:id`
* **Method**: `DELETE`
* **Auth Required**: Yes (Comment author, Project Manager, or Admin)
* **Success Response (200 OK)**:
  ```json
  {
    "message": "Comment deleted successfully"
  }
  ```
