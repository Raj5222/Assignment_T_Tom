// src/jwtUtils.ts
import * as Jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "SECRET_KEY"; // Use a strong secret key

export const generateToken = (userId: string): string => {
  // Generate JWT Token
  try{
      return Jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: "100h" }); // Token expires in 100 hour
  }catch(error){
    return `${error}\nNot Valid token`;
  }
};

export const verifyToken = (token: string) => {
  try {
    const result = Jwt.verify(token, SECRET_KEY);
    console.log("JWT Result =>",result)
    return result;
  } catch (error) {
    return `${error}\nNot Valid token`;
  }
};
