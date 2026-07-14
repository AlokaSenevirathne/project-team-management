"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentController_1 = require("../controllers/commentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
// mergeParams is required to access taskId from the parent router (taskRoutes)
const router = express_1.default.Router({ mergeParams: true });
router.get("/", authMiddleware_1.authenticate, commentController_1.getCommentsByTaskId);
router.post("/", authMiddleware_1.authenticate, commentController_1.createComment);
router.delete("/:id", authMiddleware_1.authenticate, commentController_1.deleteComment);
exports.default = router;
