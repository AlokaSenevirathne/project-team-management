import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../utils/prisma";
import { generateToken } from "../utils/jwt";


export const register = async (
  req: Request,
  res: Response
) => {

  try {

    const { name, email, password, role } = req.body;


    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });


    if(existingUser){
      return res.status(400).json({
        message:"User already exists"
      });
    }


    const hashedPassword = await bcrypt.hash(password,10);


    const user = await prisma.user.create({
      data:{
        name,
        email,
        password:hashedPassword,
        role
      }
    });


    const token = generateToken(
      user.id,
      user.role
    );


    res.status(201).json({
      message:"User created successfully",
      token,
      user:{
        id:user.id,
        name:user.name,
        email:user.email,
        role:user.role
      }
    });


  } catch(error){

    res.status(500).json({
      message:"Server error"
    });

  }

};