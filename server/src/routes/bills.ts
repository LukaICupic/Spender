import express, { Request, Response } from 'express';
import { getBills } from '../services/billsService';

const router = express.Router();

//Get bills
router.get('/', async(req:Request, res:Response) => {
    const bills = await getBills();
    return res.json(bills);
})

export default router;