import { Response } from "express";
import prisma from "../utils/prisma";

export const getUsers = async (
    req:any,
    res:Response
)=>{

    try{

        const users = await prisma.user.findMany({

            select:{
                id:true,
                name:true,
                email:true,
                role:true
            }

        });


        res.json(users);


    }catch(error){

        console.error(error);

        res.status(500).json({
            message:"Server error"
        });

    }

};