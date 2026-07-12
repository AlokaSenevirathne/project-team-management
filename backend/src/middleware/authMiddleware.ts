import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "default_secret";


export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}


export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {

    try {

        const authHeader = req.headers.authorization;


        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }


        const token = authHeader.split(" ")[1];


        const decoded = jwt.verify(
            token,
            JWT_SECRET
        ) as {
            id:number;
            role:string;
        };


        req.user = decoded;


        next();


    } catch(error){

        return res.status(401).json({
            message:"Invalid token"
        });

    }

};
export const authorize = (...roles:string[]) => {

    return (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {


        if(!req.user){
            return res.status(401).json({
                message:"Unauthorized"
            });
        }


        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                message:"Access denied"
            });
        }


        next();

    };

};