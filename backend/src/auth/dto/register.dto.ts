import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Sardor',
    description: 'Foydalanuvchining ismi (majburiy maydon)',
  })
  @IsNotEmpty({ message: 'Ism maydoni bo‘sh bo‘lishi mumkin emas' })
  firstName: string;

  @ApiProperty({
    example: 'Bek',
    description: 'Foydalanuvchining familiyasi (majburiy maydon)',
  })
  @IsNotEmpty({ message: 'Familiya maydoni bo‘sh bo‘lishi mumkin emas' })
  lastName: string;

  @ApiProperty({
    example: 'sardor@gmail.com',
    description: 'Foydalanuvchining email manzili (majburiy, yagona)',
  })
  @IsNotEmpty({ message: 'Email maydoni bo‘sh bo‘lishi mumkin emas' })
  @IsEmail({}, { message: 'Email formati noto‘g‘ri kiritilgan' })
  email: string;

  @ApiProperty({
    example: '123456789',
    description: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak',
  })
  @IsNotEmpty({ message: 'Parol maydoni bo‘sh bo‘lishi mumkin emas' })
  @MinLength(6, {
    message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak',
  })
  password: string;
}
