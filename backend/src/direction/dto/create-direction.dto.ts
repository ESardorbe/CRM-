import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateDirectionDto {
  @ApiProperty({ example: 'Matematika' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Asosiy matematika kursi', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'odd', enum: ['odd', 'even', 'daily'] })
  @IsNotEmpty()
  @IsIn(['odd', 'even', 'daily'])
  dayType: string;

  @ApiProperty({ example: '09:00' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @IsNotEmpty()
  @IsString()
  endTime: string;
}
