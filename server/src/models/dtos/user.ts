export interface UserLoginDto {
    userName: string,
    password: string
}
export interface UserLoginResponse {
    success: boolean;
    message: string;
  }