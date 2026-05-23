import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'foydalanuvchi@gmail.com',
    description: 'Parolni tiklash uchun foydalanuvchining email manzili',
  })
  @IsNotEmpty({ message: 'Email bo‘sh bo‘lishi mumkin emas' })
  @IsEmail({}, { message: 'Email formati noto‘g‘ri kiritilgan' })
  email: string;

  @ApiProperty({
    example: '893745',
    description: 'Emailga yuborilgan tasdiqlash kodi',
  })
  @IsNotEmpty({ message: 'Tasdiqlash kodi kiritilishi shart' })
  verifyCode: string;

  @ApiProperty({
    example: 'qwertyui',
    description: 'Yangi parol (kamida 6 ta belgidan iborat)',
  })
  @IsNotEmpty({ message: 'Yangi parol bo‘sh bo‘lishi mumkin emas' })
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak' })
  newPassword: string;
}
