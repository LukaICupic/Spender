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
