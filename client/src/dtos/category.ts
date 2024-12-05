export interface CategoryResponseDto {
  data?: CategoryDto[]
  error?: string
}

export interface CategoryDto {
  id: string
  name: string
}
