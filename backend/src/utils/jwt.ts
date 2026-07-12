import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export const generateToken = (userId: number, role: string) => {
  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};