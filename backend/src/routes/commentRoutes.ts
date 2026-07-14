import express from "express";
import {
  getCommentsByTaskId,
  createComment,
  deleteComment,
} from "../controllers/commentController";
import { authenticate } from "../middleware/authMiddleware";

// mergeParams is required to access taskId from the parent router (taskRoutes)
const router = express.Router({ mergeParams: true });

router.get("/", authenticate, getCommentsByTaskId);
router.post("/", authenticate, createComment);
router.delete("/:id", authenticate, deleteComment);

export default router;
