export interface CategoryDto {
  text: string
  value: string
}

export interface CategoryResponseDto {
  data?: CategoryDto[]
  error?: string
}

export interface BillResponseDto {
  message?: string
  error?: string
}
export interface CategoriesResponseDto {
  message?: string
  error?: string
}

export interface UploadBillDto {
  data: QRUploadedDto | PDF417UploadedDto
  error?: string
}

interface QRUploadedDto {
  category: null
  amount: number
  date_of_payment: Date
}

interface PDF417UploadedDto {
  category?: string | null
  amount: number
  date_of_payment: Date
}

enum ReceiptCategory {
  BILL_PAYMENT = 'Režije',
  GROCERIES = 'Nabavka',
  TRANSPORT = 'Transport',
  ENTERTAINMENT = 'Zabava',
  PERSONAL_CARE = 'Osobna njega',
  OTHER = 'Ostalo',
}
