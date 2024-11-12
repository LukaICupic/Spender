import { ReceiptCategory } from "../constants/Constants";

export interface BillModel {
    category: string;
    amount: number;
    date_of_payment: Date;
  }

  export interface PDF417UploadedModel {
    category?: ReceiptCategory | null;
    amount: number;
    date_of_payment: Date;
  }

  export interface QRUploadedModel {
    amount: number;
    date_of_payment: Date;
  }
  