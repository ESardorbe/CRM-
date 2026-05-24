import { IsString, IsOptional, IsUUID, IsDateString, IsInt, Min, Max } from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  courseId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxScore?: number;
}
