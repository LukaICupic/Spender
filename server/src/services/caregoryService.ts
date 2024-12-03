import { db } from "../db";
import { categoryModel } from "../db/schema";
import { CategoryDto } from "../models/dtos/category";

export const getCategories = async():Promise<CategoryDto[]> => {
    try {
        var categories =  await db.select().from(categoryModel)
        
        const mappedCategories: CategoryDto[] = categories.map(category => ({
            id: category.id,
            name: category.category_name,
        }));

        return mappedCategories;
    } catch (error:any) {
        console.error('Error fetching categories:', error);
        throw new Error(`${error.message}`);
    }
}