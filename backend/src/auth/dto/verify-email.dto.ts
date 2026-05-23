import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'foydalanuvchi@example.com',
    description: 'Tasdiqlash kodi yuborilgan email manzili',
  })
  @IsNotEmpty({ message: 'Email maydoni bo‘sh bo‘lishi mumkin emas' })
  @IsEmail({}, { message: 'Email formati noto‘g‘ri kiritilgan' })
  email: string;

  @ApiProperty({
    example: '829301',
    description: 'Emailga yuborilgan 6 xonali tasdiqlash kodi',
  })
  @IsNotEmpty({ message: 'Tasdiqlash kodi bo‘sh bo‘lishi mumkin emas' })
  verifyCode: string;
}
