import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = express.Router();

// Get users: ADMIN and PROJECT_MANAGER can view lists of users
router.get("/", authenticate, authorize("ADMIN", "PROJECT_MANAGER"), getUsers);

// Admin only actions
router.post("/", authenticate, authorize("ADMIN"), createUser);
router.put("/:id", authenticate, authorize("ADMIN"), updateUser);
router.delete("/:id", authenticate, authorize("ADMIN"), deleteUser);

export default router;
