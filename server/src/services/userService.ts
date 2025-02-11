import {db} from '../db/index';
import {sessionModel, userModel} from '../db/schema';
import { eq,} from "drizzle-orm";
import bcrypt from 'bcrypt';
import { UserLoginDto } from '../models/dtos/user';
import { NextFunction } from 'express';
import {Request, Response} from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SessionDataWithValidation, SessionSchema } from '../models/dtos/session';

export const loginUser = async(loginData:UserLoginDto) => {
    try {
        if(!loginData.userName || !loginData.password)
            throw new Error("Username and password are required.");

        var foundUser = await db.select().from(userModel).where(eq(userModel.user_name, loginData.userName))

        if(foundUser.length <= 0)
            throw new Error("Username or password is invalid.")
        var isMatch = await bcrypt.compare(loginData.password, foundUser[0].password)
        if (!isMatch) throw new Error("Username or password is invalid.");

        const sessionId = await createSession(foundUser[0].id);
        
        return sessionId;
    } catch (error:any) {
        console.error('Error authenticating user:', error);
        throw new Error(error.message);
    }
}

export const createSession = async(userId:number) => {
    try {
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

        const sessionData:SessionDataWithValidation = {
            session_id: sessionId,
            user_id: userId,
            expires_at: expiresAt
        }

        SessionSchema.parse(sessionData);

        await db.insert(sessionModel).values(sessionData);

        return sessionId;
    } catch (error) {
        console.error("Error creating session:", error);
        throw new Error("Error creating session");
    }
}

export const validateSession = async (req:Request, res:Response, next:NextFunction) => {
    try {
        const sessionId = req.cookies?.sessionId;
        if (!sessionId) return res.status(401).json({ error: "No session found" });

        try{
            const sessionDb = await db.select().from(sessionModel).where(eq(sessionModel.session_id, sessionId))

            if(!sessionDb || new Date(sessionDb[0].expires_at) < new Date()){
                await db.delete(sessionModel).where(eq(sessionModel.session_id, sessionId))
                return res.status(401).json({ error: 'Session expired or invalid' });
            }

            req.userId = sessionDb[0].user_id;
            next();
        } catch(error){
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        console.error("Token validation failed:", error);
        res.status(401).json({ error: "Invalid or expired authentication token" });
    }
}