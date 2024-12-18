export interface UserLoginDto {
    userName: string,
    password: string
}

export interface LoginResponse {
    success: boolean;
    message: string;
  }