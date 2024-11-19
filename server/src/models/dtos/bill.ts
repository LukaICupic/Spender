import { z } from "zod";
import { ReceiptCategory } from "../../constants/Constants";

  export interface PDF417UploadedDto {
    category?: string | null;
    amount: number;
    date_of_payment: Date;
  }

  export interface QRUploadedDto {
    amount: number;
    date_of_payment: Date;
  }

  export interface BillsCategoryModel {
    text: string;
    value: string;
  }

  export interface BillSavedDto {
  message?:string,
  error?:string
  }

const [firstKey, ...otherKeys] = Object.keys(ReceiptCategory).filter(key => isNaN(Number(key))) as (keyof typeof ReceiptCategory)[];

export const createBill = z.object({
  category: z.enum([firstKey, ...otherKeys] as const), 
  amount: z.number(),
  payer: z.string().min(4, { message: "Payer length must be at least 4 characters" }),
  date: z.coerce.date()
}).transform(data => ({
  ...data,
  date_of_payment : data.date
}));

export const uploaBill = z.object({
  content: z.string(),
  format: z.number()
})

export type CreateBillDto = z.infer<typeof createBill>
export type UploadBillDto = z.infer<typeof uploaBill>