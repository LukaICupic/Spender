import {db} from '../db/index';
import {userModel} from '../db/schema';
import { eq,} from "drizzle-orm";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserLoginDto } from '../models/dtos/user';

export const loginUser = async(loginData:UserLoginDto) => {
    try {
        if(!loginData.userName || !loginData.password)
            throw new Error("Username and password are required.");

        var foundUser = await db.select().from(userModel).where(eq(userModel.user_name, loginData.userName))

        if(foundUser.length <= 0)
            throw new Error("Username or password is invalid.")
        
        var isMatch = await bcrypt.compare(loginData.password, foundUser[0].password)
        if (!isMatch) 
            throw new Error('Invalid credentials');

        const token = jwt.sign(
            {userId: foundUser[0].id, userName: foundUser[0].user_name},
            process.env.JWT_SECRET!,
            {expiresIn : '48h'}
        )

        return token;

    } catch (error:any) {
        console.error('Error authenticating user:', error);
        throw new Error(`Error authenticating user: ${error.message}`);
    }
}