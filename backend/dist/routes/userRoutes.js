"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Get users: ADMIN and PROJECT_MANAGER can view lists of users
router.get("/", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN", "PROJECT_MANAGER"), userController_1.getUsers);
// Admin only actions
router.post("/", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN"), userController_1.createUser);
router.put("/:id", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN"), userController_1.updateUser);
router.delete("/:id", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN"), userController_1.deleteUser);
exports.default = router;
