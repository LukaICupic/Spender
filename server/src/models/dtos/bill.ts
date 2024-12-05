import { z } from "zod";
import { ReceiptCategory } from "../../constants/Constants";

  export interface FilterResponseDto {
    category: number;
    date: string;
    totalAmount: number;
  }
  export interface PDF417UploadedDto {
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
    categories?:Array<number>,
    rangeType:RangeType
  }

  export enum RangeType {
    Godine = 'Godine',
    Mjeseci = 'Mjeseci',
    Dani = 'Dani',
  }

  export const createBill = z.object({
    category: z.number(),
    amount: z.number(),
    payer: z.number(),
    date: z.coerce.date(),  // Ensure that date is coerced to a Date object
  }).transform(data => ({
    ...data,
    date_of_payment: data.date,  // Transform 'date' into 'date_of_payment'
  }));

export const uploaBill = z.object({
  content: z.string(),
  format: z.number()
})

export type CreateBillDto = z.infer<typeof createBill>
export type UploadBillDto = z.infer<typeof uploaBill>