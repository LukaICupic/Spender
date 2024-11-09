import { Payee } from "../constants/Constants";
import { PDF417UploadedModel } from "../models/bill";

export const uploadBill = async (bill:any) => {
    try {
        console.log("bill", bill)
        // if(bill.format == BarcodeFormat.QR_CODE)
        //     return await handleQRCode(correctedText)
        if(bill.format == BarcodeFormat.PDF_417)
            return await handlePDF417Code(bill.text)
    } catch (error) {
        console.error('Error processing bill:', error);
        throw error;
    }
};

const handleQRCode = async(content:string) => {

}

//Not sure that the lines will be always be at the right place and numbering 13?
const handlePDF417Code = async(content:string) => {
    try {
        const lines = content.split('\n').map(line => line.trim());

        console.log("lines", lines);
        if(lines.length < 15 || lines.length > 15)
            console.error('Number of lines is not 14 - PDF417')

        const payeeName = lines[6];
        const isPayeeValid = Object.values(Payee).includes(payeeName as Payee);

        const bill: PDF417UploadedModel = {
            category: isPayeeValid ? payeeName : undefined,
            payee_name: payeeName,
            amount: parseInt(lines[2], 10) / 100,
            date_of_payment: new Date()
          };

          console.log("final bill", bill);
          return bill;

    } catch (error) {
        
    }
}

enum BarcodeFormat {
    AZTEC = 0,
    CODABAR = 1,
    CODE_39 = 2,
    CODE_93 = 3,
    CODE_128 = 4,
    DATA_MATRIX = 5,
    EAN_8 = 6,
    EAN_13 = 7,
    ITF = 8,
    MAXICODE = 9,
    PDF_417 = 10,
    QR_CODE = 11,
    RSS_14 = 12,
    RSS_EXPANDED = 13,
    UPC_A = 14,
    UPC_E = 15,
    UPC_EAN_EXTENSION = 16
}