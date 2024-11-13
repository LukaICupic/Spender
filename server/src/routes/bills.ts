import express, { Request, Response } from 'express';
import { saveBill, uploadBill, getBillCategories } from '../services/billsService';
import { BillsCategoryModel, PDF417UploadedDto, QRUploadedDto } from '../models/dtos/bill';

const router = express.Router();

//Get bills
router.post('/save-bill', async(req:Request, res:Response) => {
    try {
        var a = await saveBill(req.body);  
        res.status(200).json({ message: 'Bill saved successfully' });
    } catch (error: any) {
        console.error('Error saving bill:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
})

router.post('/send-bill', async(req:Request, res:Response<{data:QRUploadedDto | PDF417UploadedDto}>) => {
    try {
        const billData = await uploadBill(req.body);
        res.status(200).json({ data: billData });
    } catch (error:any) {
        throw new Error(error.message)
    }
})

router.get('/categories', async (req:Request, res:Response<{data:BillsCategoryModel[]}>) => {
    try{
        const categories = await getBillCategories();
        return res.status(200).json({ data:categories });
    }catch(error:any){
        throw new Error(error.message)
    }
})

export default router;