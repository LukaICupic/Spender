
import express, { Request, Response } from 'express';
import { loginUser, validateSession } from '../services/userService';
import { UserLoginResponse, UserLoginDto } from '../models/dtos/user';

const router = express.Router();

router.post('/login', async(req:Request<UserLoginDto>, res:Response<{data?:UserLoginResponse, error?:string}>) => {
    try {
        const sessionId = await loginUser(req.body);
        
        res.cookie('sessionId', sessionId, {
            httpOnly:true,
            secure: process.env.NODE_ENV === 'PRODUCTION',
            maxAge: 48 * 60 * 60 * 1000,
            sameSite: 'lax'
        }).json({
            data: {success:true, message: 'Logged In'}
        })
    } catch (error:any) {
        res.status(500).json({ error: error instanceof  Error ? error.message :  'Internal Server Error' });
    }
})

router.post('/verify-session', validateSession, async(req:Request, res:Response) => {
    res.status(200).json({ success: true, message: "Session is valid" });
})


export default router;