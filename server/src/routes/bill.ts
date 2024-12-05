import express, { Request, Response } from 'express';
import { saveBill, uploadBill, getBillCategories, filterBills } from '../services/billService';
import { BillSavedDto, BillsCategoryModel, CreateBillDto, FilterDto, FilterResponseDto, PDF417UploadedDto, QRUploadedDto, UploadBillDto } from '../models/dtos/bill';
import { validateToken } from '../services/userService';

const router = express.Router();

//Get bills
router.post('/save-bill', validateToken, async(req:Request<{},{},CreateBillDto>, res:Response<BillSavedDto>) => {
    try {
        await saveBill(req.body, req.userId!);
        res.status(200).json({message:'Bill saved successfully'});
    } catch (error: any) {
        console.error('Error saving bill:', error);
        res.status(500).json({ error: error instanceof  Error ? error.message :  'Internal Server Error' });
    }
})

router.post('/send-bill', validateToken, async(req:Request<{},{},UploadBillDto>, res:Response<{data?:QRUploadedDto | PDF417UploadedDto, error?:string}>) => {
    try {
        console.log("req", req.body)
        const billData = await uploadBill(req.body);
        res.status(200).json({ data: billData });
    } catch (error:any) {
        res.status(500).json({ error: error instanceof  Error ? error.message :  'Internal Server Error' });
    }
})

router.post('/filter-bills', validateToken, async(req:Request<{},{},FilterDto>, res:Response<{data?:FilterResponseDto[], error?:string}>) => {
    try {
        var filteredData = await filterBills(req.body);
        return res.status(200).json({ data: filteredData });
    } catch (error:any) {
        res.status(500).json({ error: error instanceof  Error ? error.message :  'Internal Server Error' });
    }})

export default router;
