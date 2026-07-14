"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN", "PROJECT_MANAGER"), taskController_1.createTask);
router.get("/", authMiddleware_1.authenticate, taskController_1.getTasks);
router.get("/:id", authMiddleware_1.authenticate, taskController_1.getTaskById);
router.put("/:id", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN", "PROJECT_MANAGER"), taskController_1.updateTask);
router.delete("/:id", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN"), taskController_1.deleteTask);
router.put("/:id/status", authMiddleware_1.authenticate, taskController_1.updateTaskStatus);
const commentRoutes_1 = __importDefault(require("./commentRoutes"));
router.use("/:taskId/comments", commentRoutes_1.default);
exports.default = router;
