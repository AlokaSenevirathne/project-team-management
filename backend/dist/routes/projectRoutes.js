"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController_1 = require("../controllers/projectController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Create project
router.post("/", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN", "PROJECT_MANAGER"), projectController_1.createProject);
// View projects
router.get("/", authMiddleware_1.authenticate, projectController_1.getProjects);
// View single project
router.get("/:id", authMiddleware_1.authenticate, projectController_1.getProjectById);
router.put("/:id", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN", "PROJECT_MANAGER"), projectController_1.updateProject);
router.delete("/:id", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN"), projectController_1.deleteProject);
// Assign team member to project
router.post("/:projectId/members", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN", "PROJECT_MANAGER"), projectController_1.addMember);
// Remove team member from project
router.delete("/:projectId/members/:userId", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN", "PROJECT_MANAGER"), projectController_1.removeMember);
exports.default = router;
