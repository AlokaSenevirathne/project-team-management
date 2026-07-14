"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get("/admin", authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)("ADMIN"), (req, res) => {
    res.json({
        message: "Welcome Admin"
    });
});
exports.default = router;
