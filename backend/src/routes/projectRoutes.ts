import express from "express";

import {
    createProject,
    getProjects,
    getProjectById
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


export default router;