import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";


// Create Project
export const createProject = async (
    req: AuthRequest,
    res: Response
) => {

    try {

        const { name, description } = req.body;


        const project = await prisma.project.create({
            data: {
                name,
                description,
                managerId: req.user!.id
            }
        });


        res.status(201).json({
            message: "Project created successfully",
            project
        });


    } catch(error){

        res.status(500).json({
            message:"Server error"
        });

    }

};



// Get All Projects
export const getProjects = async (
    req: Request,
    res: Response
) => {

    try {

        const projects = await prisma.project.findMany({
            include:{
                manager:true,
                tasks:true
            }
        });


        res.json(projects);


    } catch(error){

        res.status(500).json({
            message:"Server error"
        });

    }

};



// Get Single Project
export const getProjectById = async (
    req: Request,
    res: Response
) => {

    try {

        const project = await prisma.project.findUnique({
            where:{
                id:Number(req.params.id)
            },
            include:{
                manager:true,
                tasks:true,
                members:{
                    include:{
                        user:true
                    }
                }
            }
        });


        if(!project){
            return res.status(404).json({
                message:"Project not found"
            });
        }


        res.json(project);


    } catch(error){

        res.status(500).json({
            message:"Server error"
        });

    }

};