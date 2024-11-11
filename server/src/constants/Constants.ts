//Bill types
export const HRVHUB30 = "HRVHUB30";

//Categories
export enum ReceiptCategory {
    BILL_PAYMENT = "Režije",
    GROCERIES = "Nabavka",
    TRANSPORT = "Transport",
    ENTERTAINMENT = "Zabava",
    PERSONAL_CARE = "Osobna njega",
    OTHER = "Ostalo"
}

//Expand for all PDF417 bills
export enum Bill_Payment_Payee {
    HRVATSKI_TELEKOM = "Hrvatski Telekom d.d.",
}

export enum BarcodeFormat {
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