import express, { Request, Response } from 'express';
import { saveBill, uploadBill, getBillCategories } from '../services/billsService';

const router = express.Router();

//Get bills
router.post('/save-bill', async(req:Request, res:Response) => {
    try {
        const billData = await saveBill(req.body);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process bill' });
    }
})

router.post('/send-bill', async(req:Request, res:Response) => {
    try {
        const billData = await uploadBill(req.body);
        res.status(200).json({ message: 'Bill processed successfully', data: billData });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process bill' });
    }
})

router.get('/categories', async (req:Request, res:Response) => {
    const categories = await getBillCategories();
    return res.status(200).json({ message: 'Bill processed successfully', data: categories });
})

export default router;