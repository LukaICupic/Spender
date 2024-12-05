import {db} from '../db/index';
import {userModel} from '../db/schema';
import { eq,} from "drizzle-orm";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserLoginDto } from '../models/dtos/user';
import { NextFunction } from 'express';
import {Request, Response} from 'express';

export const loginUser = async(loginData:UserLoginDto) => {
    try {
        if(!loginData.userName || !loginData.password)
            throw new Error("Username and password are required.");

        var foundUser = await db.select().from(userModel).where(eq(userModel.user_name, loginData.userName))

        if(foundUser.length <= 0)
            throw new Error("Username or password is invalid.")
        
        var isMatch = await bcrypt.compare(loginData.password, foundUser[0].password)
        if (!isMatch) throw new Error("Username or password is invalid.");
        
        const token = jwt.sign(
            {userId: foundUser[0].id, userName: foundUser[0].user_name},
            process.env.JWT_SECRET!,
            {expiresIn : '48h'}
        )

        return token;

    } catch (error:any) {
        console.error('Error authenticating user:', error);
        throw new Error(error.message);
    }
}

export const validateToken = (req:Request, res:Response, next:NextFunction) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ error: "Authentication token is missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
        req.userId = decoded.userId;
        console.log("Decoded user:", decoded);

        next();
    } catch (error) {
        console.error("Token validation failed:", error);
        res.status(401).json({ error: "Invalid or expired authentication token" });
    }
}