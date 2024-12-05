import { db } from "../db";
import { categoryModel } from "../db/schema";
import { CategoryDto, createCategory, CreateCategoryDto } from "../models/dtos/category";
import { SQL, and, gte, lte, inArray, eq} from "drizzle-orm";


export const getCategories = async():Promise<CategoryDto[]> => {
    try {
        var categories = await db.select().from(categoryModel)
        console.log("found C", categories)
        const mappedCategories: CategoryDto[] = categories.map(category => ({
            id: category.id,
            name: category.name,
        }));

        return mappedCategories;
    } catch (error:any) {
        console.error('Error fetching categories:', error);
        throw new Error(`${error.message}`);
    }
}

export const saveCategory = async (category:CreateCategoryDto) => {
    try {
        const validateBill = createCategory.safeParse(category);

        if (!validateBill.success) {
            console.error("VALIDATION ZOD MESSAGE", validateBill.error.message)
            throw new Error("Category name can't be empty");
        }

        const existingCategory = await db
            .select().from(categoryModel)
            .where(
                and(
                  eq(categoryModel.name, category.name),
                  eq(categoryModel.user_id, category.userId)
                )
              )
            .limit(1)

        if (existingCategory.length > 0) 
            throw new Error('Category with the same name already exists.');       

        await db.insert(categoryModel).values({ name:category.name, user_id: category.userId });
    } catch (error:any) {
        console.error("Error saving category:", error);
        throw new Error(`${error.message}`);
    }
};