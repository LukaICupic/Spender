import { BarcodeFormat, ReceiptCategory } from "../constants/Constants";
import { CreateBillDto, createBill, PDF417UploadedDto, QRUploadedDto, UploadBillDto, uploaBill, BillsCategoryModel, FilterDto, RangeType, FilterResponseDto } from "../models/dtos/bill";
import {db} from '../db/index';
import {billModel, categoryModel} from '../db/schema';
import { SQL, and, gte, lte, inArray, sql, eq} from "drizzle-orm";

export const saveBill = async(bill: Omit<CreateBillDto, 'payer'>, userId: number) => {
    try {
        const validateBill = createBill.safeParse({...bill, payer: userId});

        if (!validateBill.success) {
            console.error('Validation failed:', validateBill.error);
            throw new Error('Invalid bill data');
        }

        const dbBill = {
            category_id: validateBill.data.category,
            user_id: validateBill.data.payer,      
            amount: validateBill.data.amount,
            date_of_payment: validateBill.data.date_of_payment,
          };

          return await db.insert(billModel).values(dbBill);
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

        const bill: PDF417UploadedDto = {
            amount: parseInt(lines[2], 10) / 100,
            date_of_payment: new Date()
          };

          return bill;

    } catch (error:any) {
        console.error('Error processing bill:', error);
        throw new Error(`Failed to process PDF417: ${error.message}`);
    }
}

export const filterBills = async (filter:FilterDto, userId:number): Promise<FilterResponseDto[]> => { 
    console.log("filter",filter)   
    const filters: SQL[] = [];
    let groupByDate: SQL | null = null;
    if (filter.categories && Array.isArray(filter.categories) && filter.categories.length > 0)
        filters.push(inArray(billModel.category_id, filter.categories))
    if(filter.dateFrom) {
        const dateFromUTC = new Date(`${filter.dateFrom}T00:00:00.000Z`);
        filters.push(gte(billModel.date_of_payment, dateFromUTC));        
    }
    
    if(filter.dateTo){
        const dateToUTC = new Date(`${filter.dateTo}T23:59:59.999Z`);
        filters.push(lte(billModel.date_of_payment, dateToUTC));
    }

    if(userId)
        filters.push(eq(billModel.user_id, userId))

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
        categoryId: billModel.category_id,
        categoryName: categoryModel.name,
        totalAmount: sql`SUM(${billModel.amount})`
    }).from(billModel)
    .innerJoin(categoryModel, eq(billModel.category_id, categoryModel.id))
    .where(and(...filters)).groupBy(groupByDate, billModel.category_id, billModel.date_of_payment, categoryModel.name).orderBy(billModel.date_of_payment);

    var finalResult: FilterResponseDto[] = queryResult.map(({ categoryId, categoryName, totalAmount, date }) => ({
        categoryId: categoryId as number,
        categoryName: categoryName as string,
        totalAmount: totalAmount as number,
        date: date as string,
    }));

    console.log("finalResult",finalResult)

    return finalResult;
}
