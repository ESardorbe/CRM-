import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@gmail.com',
    description: 'Foydalanuvchining email manzili',
  })
  @IsEmail({}, { message: 'Email formati noto‘g‘ri kiritilgan' })
  email: string;

  @ApiProperty({
    example: '123456789',
    description: 'Foydalanuvchi paroli (kamida 6 ta belgidan iborat)',
  })
  @IsNotEmpty({ message: 'Parol bo‘sh bo‘lishi mumkin emas' })
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak' })
  password: string;
}
