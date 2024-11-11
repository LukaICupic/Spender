import { Bill_Payment_Payee, BarcodeFormat, ReceiptCategory } from "../constants/Constants";
import { PDF417UploadedModel, QRUploadedModel } from "../models/bill";

export const uploadBill = async (bill:any) => {
    try {
        console.log("bill", bill)
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

        const dateTime = urlObj.searchParams.get('datv');
        const price = Number(urlObj.searchParams.get('izn'));

        const bill: QRUploadedModel = {
            amount: price / 100,
            date_of_payment: new Date()
        }

        console.log("final bill", bill);
        return bill;
    } catch (error) {
        console.error('Error processing bill:', error);
    }
}

//Not sure that the lines will be always be at the right place and numbering 13?
const handlePDF417Code = async(content:string) => {
    try {
        const lines = content.split('\n').map(line => line.trim());

        console.log("lines", lines);
        if(lines.length < 15 || lines.length > 15)
            console.error('Number of lines is not 14 - PDF417')

        const payeeName = lines[6];
        const categoryFound = findCategory(payeeName);

        const bill: PDF417UploadedModel = {
            category: "",
            payee_name: payeeName,
            amount: parseInt(lines[2], 10) / 100,
            date_of_payment: new Date()
          };

          console.log("final bill", bill);
          return bill;

    } catch (error) {
        console.error('Error processing bill:', error);
    }
}

const findCategory = (category:string) => {
    if (Object.values(Bill_Payment_Payee).includes(category as Bill_Payment_Payee)) {
        return ReceiptCategory.BILL_PAYMENT; // You can modify this based on your mapping logic
    }
    return null;
} 

