import { IsNotEmpty, IsString, IsOptional, IsIn, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceRecordDto {
  @IsNotEmpty() @IsString() studentId: string;
  @IsOptional() @IsIn(['present', 'absent', 'late']) status?: string;
  @IsOptional() @IsString() note?: string;
}

export class BulkAttendanceDto {
  @IsNotEmpty() @IsString() courseId: string;
  @IsNotEmpty() @IsDateString() date: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}

export class GetAttendanceDto {
  @IsOptional() @IsString() courseId?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() studentId?: string;
}
