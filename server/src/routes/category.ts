import express, { Request, Response } from 'express';
import { CategoryDto, CreateCategoryDto } from "../models/dtos/category";
import { getCategories, saveCategory } from "../services/caregoryService";
import { validateToken } from '../services/userService';

const router = express.Router();

router.get('/categories', validateToken, async (req:Request, res:Response<{data?:CategoryDto[], error?:string}>) => {
    try{
        const categories = await getCategories();
        return res.status(200).json({ data:categories });
    }catch(error){
        res.status(500).json({ error: error instanceof  Error ? error.message :  'Internal Server Error' });
    }
})

router.post('/category-save', validateToken, async (req:Request<{},{},CreateCategoryDto>, res:Response<{data?:CategoryDto[], error?:string}>) => {
    try{
        await saveCategory({name:req.body.name, userId:req.userId!});
        return res.status(200).json();
    }catch(error){
        res.status(500).json({ error: error instanceof  Error ? error.message :  'Internal Server Error' });
    }
})

export default router;