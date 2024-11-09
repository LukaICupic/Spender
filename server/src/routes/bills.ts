import express, { Request, Response } from 'express';
import { uploadBill } from '../services/billsService';

const router = express.Router();

//Get bills
router.post('/send-bill', async(req:Request, res:Response) => {
    try {
        const billData = await uploadBill(req.body);
        res.status(200).json({ message: 'Bill processed successfully', data: billData });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process bill' });
    }
})

export default router;