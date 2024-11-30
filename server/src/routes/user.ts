
import express, { Request, Response } from 'express';
import { loginUser } from '../services/userService';
import { LoginResponse, UserLoginDto } from '../models/dtos/user';

const router = express.Router();

router.post('/login', async(req:Request<UserLoginDto>, res:Response<{data?:LoginResponse, error?:string}>) => {
    try {
        const userData = await loginUser(req.body);
        console.log("userData", userData)
        res.cookie('token', userData, {
            httpOnly:false,
            secure: process.env.NODE_ENV === 'PRODUCTION',
            maxAge: 48 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === 'PRODUCTION' ? 'strict':'none'
        }).json({
            data: {success:true, message: 'Logged In'}
        })
    } catch (error:any) {
        res.status(500).json({ error: error instanceof  Error ? error.message :  'Internal Server Error' });
    }
})

export default router;