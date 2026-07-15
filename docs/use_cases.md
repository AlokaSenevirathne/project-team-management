# Use Case Diagram

The use cases are structured around the three main user roles: **Administrator (Admin)**, **Project Manager (PM)**, and **Team Member**.

```mermaid
leftToRightDirection
actor Admin
actor PM
actor "Team Member" as TM

rectangle "Project & Team Task Management Platform" {
    usecase "Register & Authenticate" as UC_Auth
    usecase "View Profile" as UC_Profile
    
    usecase "Manage Users & Roles (CRUD)" as UC_UserMgmt
    usecase "Delete Any Project" as UC_DelProj
    
    usecase "Create Project" as UC_CreateProj
    usecase "Add/Remove Team Members" as UC_AssignMem
    usecase "Create & Assign Tasks" as UC_CreateTask
    usecase "Delete Tasks" as UC_DelTask
    
    usecase "View Assigned Projects & Tasks" as UC_ViewAssigned
    usecase "Update Task Status" as UC_UpdateStatus
    usecase "Write & Delete Comments" as UC_Comments
}

Admin --> UC_Auth
Admin --> UC_Profile
Admin --> UC_UserMgmt
Admin --> UC_DelProj
Admin --> UC_CreateProj
Admin --> UC_AssignMem
Admin --> UC_CreateTask
Admin --> UC_DelTask
Admin --> UC_Comments

PM --> UC_Auth
PM --> UC_Profile
PM --> UC_CreateProj
PM --> UC_AssignMem
PM --> UC_CreateTask
PM --> UC_DelTask
PM --> UC_ViewAssigned
PM --> UC_UpdateStatus
PM --> UC_Comments

TM --> UC_Auth
TM --> UC_Profile
TM --> UC_ViewAssigned
TM --> UC_UpdateStatus
TM --> UC_Comments
```

## Role-Based Access Control (RBAC) Permissions Matrix

| Feature / Use Case | Administrator | Project Manager | Team Member |
|:---|:---:|:---:|:---:|
| Register & Authenticate | Yes | Yes | Yes |
| View Own Profile | Yes | Yes | Yes |
| View All Users List | Yes | Yes | No |
| Create & Update Users | Yes | No | No |
| Delete Users | Yes | No | No |
| Change User Roles | Yes | No | No |
| Create Projects | Yes | Yes | No |
| Update Project Details | Yes | Yes (Managed only) | No |
| Add/Remove Project Members | Yes | Yes (Managed only) | No |
| Delete Projects | Yes | No | No |
| Create & Assign Tasks | Yes | Yes (Managed only) | No |
| Update Task Details | Yes | Yes (Managed only) | No |
| Delete Tasks | Yes | Yes (Managed only) | No |
| Update Task Status | Yes | Yes (Managed only) | Yes (Assigned only) |
| Post Task Comments | Yes | Yes (Project members) | Yes (Project members) |
| Delete Comments | Yes | Yes (Managed only) | Yes (Own only) |
