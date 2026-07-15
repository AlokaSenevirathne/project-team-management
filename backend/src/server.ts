import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import testRoutes from "./routes/testRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import userRoutes from "./routes/userRoutes";


dotenv.config();


export const app = express();


app.use(cors());

app.use(express.json());



// Routes

app.use("/api/auth", authRoutes);

app.use("/api/test", testRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/users", userRoutes);




// Test route

app.get("/", (req, res) => {

    res.json({

        message: "Project Management API is running 🚀"

    });

});



const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}