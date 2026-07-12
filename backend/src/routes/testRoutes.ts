import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = express.Router();


router.get(
    "/admin",
    authenticate,
    authorize("ADMIN"),
    (req,res)=>{
        res.json({
            message:"Welcome Admin"
        });
    }
);


export default router;