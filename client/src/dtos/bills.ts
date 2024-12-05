//Generic Dtos
export interface MessageDto {
  messageAlert: boolean
  messageType: MessageType
  messageContent: string | null
}

type MessageType = 'success' | 'info' | 'warning' | 'error'

interface ChartDataset {
  label: string
  data: number[]
  backgroundColor: string
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

//Requests

//Responses
export interface BillSaveResponseDto {
  message?: string
  error?: string
}
export interface CategoriesResponseDto {
  message?: string
  error?: string
}

export interface UploadBillResponseDto {
  data: QRUploadedDto | PDF417UploadedDto
  error?: string
}

interface QRUploadedDto {
  amount: number
  date_of_payment: Date
}

interface PDF417UploadedDto {
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
