export interface BillModel {
    category: string;
    payee_name: string;
    amount: number;
    date_of_payment: Date;
  }

  export interface PDF417UploadedModel {
    category?: string;
    payee_name?: string;
    amount: number;
    date_of_payment: Date;
  }

  export interface QRUploadedModel {
    amount: number;
    date_of_payment: Date;
  }
  