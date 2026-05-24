import { IsNumber, IsString, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class CreateGradeDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  courseId: string;

  @IsNumber()
  @Min(0)
  score: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxScore?: number;

  @IsOptional()
  @IsString()
  gradeType?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
