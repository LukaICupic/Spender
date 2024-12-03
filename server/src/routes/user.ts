
import express, { Request, Response } from 'express';
import { loginUser } from '../services/userService';
import { UserLoginResponse, UserLoginDto } from '../models/dtos/user';

const router = express.Router();

router.post('/login', async(req:Request<UserLoginDto>, res:Response<{data?:UserLoginResponse, error?:string}>) => {
    try {
        const userData = await loginUser(req.body);
        
        res.cookie('token', userData, {
            httpOnly:false,
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

export default router;