"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
// Routes
exports.app.use("/api/auth", authRoutes_1.default);
exports.app.use("/api/test", testRoutes_1.default);
exports.app.use("/api/projects", projectRoutes_1.default);
exports.app.use("/api/tasks", taskRoutes_1.default);
exports.app.use("/api/users", userRoutes_1.default);
// Test route
exports.app.get("/", (req, res) => {
    res.json({
        message: "Project Management API is running 🚀"
    });
});
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
    exports.app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
