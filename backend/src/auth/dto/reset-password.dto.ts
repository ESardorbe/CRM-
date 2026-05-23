import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'foydalanuvchi@gmail.com',
    description: 'Parolni tiklash uchun foydalanuvchining email manzili',
  })
  @IsNotEmpty({ message: 'Email maydoni bo‘sh bo‘lishi mumkin emas' })
  @IsEmail({}, { message: 'Email formati noto‘g‘ri kiritilgan' })
  email: string;
}
