import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Role } from "../enums/role.enum"

export class RegisterWithRoleDto {
  @ApiProperty({
    example: "Sardor",
    description: "Foydalanuvchining ismi (majburiy maydon)",
  })
  @IsNotEmpty({ message: "Ism maydoni bo'sh bo'lishi mumkin emas" })
  firstName: string

  @ApiProperty({
    example: "Bek",
    description: "Foydalanuvchining familiyasi (majburiy maydon)",
  })
  @IsNotEmpty({ message: "Familiya maydoni bo'sh bo'lishi mumkin emas" })
  lastName: string

  @ApiProperty({
    example: "sardor@gmail.com",
    description: "Foydalanuvchining email manzili (majburiy, yagona)",
  })
  @IsNotEmpty({ message: "Email maydoni bo'sh bo'lishi mumkin emas" })
  @IsEmail({}, { message: "Email formati noto'g'ri kiritilgan" })
  email: string

  @ApiProperty({
    example: "123456789",
    description: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
  })
  @IsNotEmpty({ message: "Parol maydoni bo'sh bo'lishi mumkin emas" })
  @MinLength(6, {
    message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
  })
  password: string

  @ApiProperty({
    example: "student",
    description: "User role (optional, defaults to 'user')",
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: "Invalid role" })
  role?: Role
}
