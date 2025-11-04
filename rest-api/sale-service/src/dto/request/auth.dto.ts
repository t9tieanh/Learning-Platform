import { IsEmail, IsString, MinLength, Length } from 'class-validator';

// Các class khác cũng sửa tương tự:
export class LoginDto {
  @IsString({ message: "Username không hợp lệ" })
  username?: string;

  @IsString({ message: "Mật khẩu không hợp lệ" })
  @MinLength(6, { message: "Mật khẩu phải từ 6 ký tự" })
  password?: string;
}

// Các class khác cũng sửa tương tự:
export class JwtPayloadDto {
  userId!: string;
  type: 'access' | 'refresh' | undefined;
}

