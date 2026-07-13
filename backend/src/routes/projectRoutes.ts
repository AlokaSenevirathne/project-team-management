import express from "express";

import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember
} from "../controllers/projectController";
import {
    authenticate,
    authorize
} from "../middleware/authMiddleware";


const router = express.Router();


// Create project
router.post(
    "/",
    authenticate,
    authorize("ADMIN","PROJECT_MANAGER"),
    createProject
);


// View projects
router.get(
    "/",
    authenticate,
    getProjects
);


// View single project
router.get(
    "/:id",
    authenticate,
    getProjectById
);
router.put(
    "/:id",
    authenticate,
    authorize("ADMIN","PROJECT_MANAGER"),
    updateProject
);


router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    deleteProject
);
// Assign team member to project
router.post(
    "/:projectId/members",
    authenticate,
    authorize("ADMIN","PROJECT_MANAGER"),
    addMember
);


export default router;