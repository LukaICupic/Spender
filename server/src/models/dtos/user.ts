import { InferModel } from "drizzle-orm";
import { z } from "zod";
import { categoryModel } from "../../db/schema";

export interface UserLoginDto {
    userName: string,
    password: string
}

export interface UserLoginResponse {
    success: boolean;
    message: string;
  }

  export const CategorySchema = z.object({
    id: z.number(),
    category_name: z.string().max(255),
    bill_id: z.number().nullable(),
    user_id: z.number().nullable(),
});

export type CategoryGet = z.infer<typeof CategorySchema>;