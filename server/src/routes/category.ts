import express, { Request, Response } from 'express';
import { CategoryDto } from "../models/dtos/category";
import { getCategories } from "../services/caregoryService";

const router = express.Router();

router.get('/categories', async (req:Request, res:Response<{data?:CategoryDto[], error?:string}>) => {
    try{
        const categories = await getCategories();
        return res.status(200).json({ data:categories });
    }catch(error){
        res.status(500).json({ error: error instanceof  Error ? error.message :  'Internal Server Error' });
    }
})

export default router;