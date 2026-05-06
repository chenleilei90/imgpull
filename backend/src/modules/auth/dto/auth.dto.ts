import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  credential: string;
}

export class LoginDto {
  @IsString()
  account: string;

  @IsString()
  credential: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  sessionId?: string;
}
