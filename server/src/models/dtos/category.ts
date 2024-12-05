import { z } from "zod"

export interface CategoryDto {
    id: number,
    name: string
}

export const createCategory = z.object({
    name: z.string().min(1, { message: "Category name can't be empty" }),
    userId: z.number()
  })

export type CreateCategoryDto = z.infer<typeof createCategory>