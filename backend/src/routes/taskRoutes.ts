import express from "express";

import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus

} from "../controllers/taskController";

import {
    authenticate,
    authorize
} from "../middleware/authMiddleware";


const router = express.Router();



router.post(
    "/",
    authenticate,
    authorize("ADMIN", "PROJECT_MANAGER"),
    createTask
);



router.get(
    "/",
    authenticate,
    getTasks
);



router.get(
    "/:id",
    authenticate,
    getTaskById
);



router.put(
    "/:id",
    authenticate,
    authorize("ADMIN", "PROJECT_MANAGER"),
    updateTask
);



router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    deleteTask
);



router.put(
    "/:id/status",
    authenticate,
    updateTaskStatus
);


import commentRoutes from "./commentRoutes";
router.use("/:taskId/comments", commentRoutes);


export default router;