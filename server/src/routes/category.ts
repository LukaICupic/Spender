import express, { Request, Response } from 'express';
import { CategoryDto, CreateCategoryDto } from "../models/dtos/category";
import { getCategories, saveCategory } from "../services/caregoryService";
import { validateSession } from '../services/userService';

const router = express.Router();

router.get('/api/categories', validateSession, async (req:Request, res:Response<{data?:CategoryDto[], error?:string}>) => {
    try{
        const categories = await getCategories(req.userId);
        return res.status(200).json({ data:categories });
    }catch(error){
        res.status(500).json({ error: error instanceof  Error ? error.message :  'Internal Server Error' });
    }
})

router.post('/api/category-save', validateSession, async (req:Request<{},{},CreateCategoryDto>, res:Response<{data?:CategoryDto[], error?:string}>) => {
    try{
        await saveCategory({name:req.body.name, userId:req.userId!});
        return res.status(200).json();
    }catch(error){
        res.status(500).json({ error: error instanceof  Error ? error.message :  'Internal Server Error' });
    }
})

export default router;