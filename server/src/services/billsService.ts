import { Bill_Payment_Payee, BarcodeFormat, ReceiptCategory } from "../constants/Constants";
import { PDF417UploadedModel, QRUploadedModel } from "../models/bill";
import {db} from '../db/index';
import {billsTable} from '../db/schema';

export const saveBill = async(bill:any) => {
    try {
        type NewBill = typeof billsTable.$inferInsert;

        var newBill: NewBill = {
            category: bill.category,
            amount: bill.amount,
            payer: "",
            date_of_payment: new Date(bill.date)
        }

        await db.insert(billsTable).values(newBill);
    } catch (error) {
        console.error('Error processing bill:', error);
    }
}

export const uploadBill = async (bill:any) => {
    try {
        if(bill.format == BarcodeFormat.QR_CODE)
            return await handleQRCode(bill.text)
        if(bill.format == BarcodeFormat.PDF_417)
            return await handlePDF417Code(bill.text)
    } catch (error) {
        console.error('Error processing bill:', error);
        throw error;
    }
};

export const getBillCategories = async() => {
    try {
        const categories = Object.entries(ReceiptCategory).map(([key, value]) => ({
            text: value,
            value: key,
        }));
        return categories;
    } catch (error) {
        console.error("Error generating categories:", error);
        return [];
    }
}

const handleQRCode = async(content:string) => {
    try {
        const urlObj = new URL(content);
        console.log("url", urlObj);
        var dateTime = urlObj.searchParams.get('datv')?.split('_')[0];
        console.log("date",dateTime)
        var formatedDate = new Date();
        if(dateTime){            
            const year = parseInt(dateTime.slice(0, 4), 10);
            const month = parseInt(dateTime.slice(4, 6), 10) - 1;
            const day = parseInt(dateTime.slice(6, 8), 10);
            formatedDate.setFullYear(year, month, day);
            console.log("formatedDate1", formatedDate)
        }

        // Handle 'izn' parameter with flexible parsing
        const iznValue = urlObj.searchParams.get('izn');
        let price;
        if(iznValue?.includes(','))
            price = parseFloat(iznValue.replace(',','.'))
        else
            price = Number(iznValue) / 100;

        console.log("priceee",price)
        const bill: QRUploadedModel = {
            amount: price,
            date_of_payment: formatedDate
        }
        console.log("QR-bill", bill)
        return bill;
    } catch (error) {
        console.error('Error processing bill:', error);
    }
}

//Not sure that the lines will be always be at the right place and numbering 13?
const handlePDF417Code = async(content:string) => {
    try {
        const lines = content.split('\n').map(line => line.trim());

        if(lines.length < 15 || lines.length > 15)
            console.error('Number of lines is not 14 - PDF417')

        const payeeName = lines[6];
        const categoryFound = findCategory(payeeName);

        const bill: PDF417UploadedModel = {
            category: categoryFound,
            amount: parseInt(lines[2], 10) / 100,
            date_of_payment: new Date()
          };

          return bill;

    } catch (error) {
        console.error('Error processing bill:', error);
    }
}

const findCategory = (category:string): ReceiptCategory | null => {
    if (Object.values(Bill_Payment_Payee).includes(category as Bill_Payment_Payee)) {
        return ReceiptCategory.BILL_PAYMENT;
    }
    return null;
} 

