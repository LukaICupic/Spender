import { z } from "zod";
import { ReceiptCategory } from "../../constants/Constants";

  export interface FilterResponseDto {
    category: ReceiptCategory;
    date: string;
    totalAmount: number;
  }
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

  export interface FilterDto {
    dateFrom:string,
    dateTo:string,
    categories?:Array<ReceiptCategory>,
    rangeType:RangeType
  }

  export enum RangeType {
    Godine = 'Godine',
    Mjeseci = 'Mjeseci',
    Dani = 'Dani',
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