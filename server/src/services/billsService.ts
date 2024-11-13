import { Bill_Payment_Payee, BarcodeFormat, ReceiptCategory } from "../constants/Constants";
import { CreateBillDto, createBill, PDF417UploadedDto, QRUploadedDto, UploadBillDto, uploaBill, BillsCategoryModel } from "../models/dtos/bill";
import {db} from '../db/index';
import {billsModel} from '../db/schema';

export const saveBill = async(bill:CreateBillDto) => {
    try {
        bill.payer = "gramAna"
        const validateBill = createBill.safeParse(bill);

        if (!validateBill.success) {
            console.error('Validation failed:', validateBill.error);
            throw new Error('Invalid bill data');
          }

        return await db.insert(billsModel).values(validateBill.data);
    } catch (error) {
        console.error('Error processing bill:', error);
    }
}

export const uploadBill = async (bill:UploadBillDto):Promise<QRUploadedDto | PDF417UploadedDto> => {
    try {
        const validateBill = uploaBill.parse(bill);

        if(validateBill.format == BarcodeFormat.QR_CODE)
            return await handleQRCode(validateBill.content)
        if(validateBill.format == BarcodeFormat.PDF_417)
            return await handlePDF417Code(validateBill.content)

        throw new Error('Unsupported barcode format');
    } catch (error) {
        console.error('Error processing bill:', error);
        throw error;
    }
};

export const getBillCategories = async(): Promise<BillsCategoryModel[]> => {
    try {
        const categories: BillsCategoryModel[] = Object.entries(ReceiptCategory).map(([key, value]) => ({
            text: value,
            value: key,
        }));
        return categories;
    } catch (error) {
        console.error("Error generating categories:", error);
        return [];
    }
}

const handleQRCode = async(content:string) : Promise<QRUploadedDto> => {
    try {
        const urlObj = new URL(content);
        var dateTime = urlObj.searchParams.get('datv')?.split('_')[0];
        var formatedDate = new Date();
        if(dateTime){            
            const year = parseInt(dateTime.slice(0, 4), 10);
            const month = parseInt(dateTime.slice(4, 6), 10) - 1;
            const day = parseInt(dateTime.slice(6, 8), 10);
            formatedDate.setFullYear(year, month, day);
        }

        // Handle 'izn' parameter with flexible parsing
        const iznValue = urlObj.searchParams.get('izn');
        let price;
        if(iznValue?.includes(','))
            price = parseFloat(iznValue.replace(',','.'))
        else
            price = Number(iznValue) / 100;

        const bill: QRUploadedDto = {
            amount: price,
            date_of_payment: formatedDate
        }
        return bill;
    } catch (error:any) {
        console.error('Error processing bill:', error);
        throw new Error(`Failed to process QR code: ${error.message}`);
    }
}

//Not sure that the lines will be always be at the right place and numbering 13?
const handlePDF417Code = async(content:string): Promise<PDF417UploadedDto> => {
    try {
        const lines = content.split('\n').map(line => line.trim());

        if(lines.length < 15 || lines.length > 15)
            console.error('Number of lines is not 14 - PDF417')

        const payeeName = lines[6];
        const categoryFound = findCategory(payeeName);

        const bill: PDF417UploadedDto = {
            category: categoryFound,
            amount: parseInt(lines[2], 10) / 100,
            date_of_payment: new Date()
          };

          return bill;

    } catch (error:any) {
        console.error('Error processing bill:', error);
        throw new Error(`Failed to process QR code: ${error.message}`);
    }
}

const findCategory = (category:string): ReceiptCategory | null => {
    if (Object.values(Bill_Payment_Payee).includes(category as Bill_Payment_Payee)) {
        return ReceiptCategory.BILL_PAYMENT;
    }
    return null;
} 

