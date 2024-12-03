import { Bill_Payment_Payee, BarcodeFormat, ReceiptCategory } from "../constants/Constants";
import { CreateBillDto, createBill, PDF417UploadedDto, QRUploadedDto, UploadBillDto, uploaBill, BillsCategoryModel, FilterDto, RangeType, FilterResponseDto } from "../models/dtos/bill";
import {db} from '../db/index';
import {billModel} from '../db/schema';
import { SQL, and, gte, lte, inArray, sql} from "drizzle-orm";

export const saveBill = async(bill:CreateBillDto) => {
    try {
        bill.payer = "gramAna"
        const validateBill = createBill.safeParse(bill);

        if (!validateBill.success) {
            console.error('Validation failed:', validateBill.error);
            throw new Error('Invalid bill data');
          }

        return await db.insert(billModel).values(validateBill.data);
    } catch (error:any) {
        console.error('Error processing bill:', error);
        throw new Error(`Error processing bill: ${error.message}`);
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
    } catch (error:any) {
        console.error('Error processing bill:', error);
        throw new Error(`Error processing bill: ${error.message}`);
    }
};

export const getBillCategories = async(): Promise<BillsCategoryModel[]> => {
    try {
        const categories: BillsCategoryModel[] = Object.entries(ReceiptCategory).map(([key, value]) => ({
            text: value,
            value: key,
        }));
        return categories;
    } catch (error:any) {
        console.error('Error generating categories:', error);
        throw new Error(`Error generating categories: ${error.message}`);
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
        console.error('Failed to process QR code', error);
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
        throw new Error(`Failed to process PDF417: ${error.message}`);
    }
}

const findCategory = (category:string): string | null => {
    if (Object.values(Bill_Payment_Payee).includes(category as Bill_Payment_Payee)) {
        const indexOfS = Object.values(ReceiptCategory).indexOf(ReceiptCategory.BILL_PAYMENT as unknown as ReceiptCategory);
        const key = Object.keys(ReceiptCategory)[indexOfS];
        return key;
    }
    return null;
} 

export const filterBills = async (filter:FilterDto): Promise<FilterResponseDto[]> => {    
    const filters: SQL[] = [];
    let groupByDate: SQL | null = null;
    if (filter.categories && Array.isArray(filter.categories) && filter.categories.length > 0) {
        filters.push(inArray(billModel.category, filter.categories))

    if(filter.dateFrom)
        filters.push(gte(billModel.date_of_payment, new Date(filter.dateFrom)))
    
    if(filter.dateTo)
        filters.push(lte(billModel.date_of_payment, new Date(filter.dateTo)))
    }

    if(filter.rangeType && Object.values(RangeType).includes(filter.rangeType)){
        switch (filter.rangeType) {
            case RangeType.Godine:
                groupByDate = sql`TO_CHAR(${billModel.date_of_payment}, 'YYYY')`;
                break;
            case RangeType.Mjeseci:
                groupByDate = sql`TO_CHAR(${billModel.date_of_payment}, 'MM-YYYY')`;
                break;
            case RangeType.Dani:
                groupByDate = sql`TO_CHAR(${billModel.date_of_payment}, 'DD-MM-YYYY')`;
                break;
            }
    }

    if (!groupByDate) {
        throw new Error("Invalid or missing rangeType for grouping");
    }

    const queryResult = await db.select({
        date: groupByDate,
        category: billModel.category,
        totalAmount: sql`SUM(${billModel.amount})`
    }).from(billModel).where(and(...filters)).groupBy(groupByDate, billModel.category).orderBy(groupByDate);

    var finalResult: FilterResponseDto[] = queryResult.map(({ category, totalAmount, date }) => ({
        category: ReceiptCategory[category as keyof typeof ReceiptCategory],
        totalAmount: totalAmount as number,
        date: date as string,
    }));

    return finalResult;
}
