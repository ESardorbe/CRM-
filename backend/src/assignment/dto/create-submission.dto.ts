import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateSubmissionDto {
  @IsUUID()
  assignmentId: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class GradeSubmissionDto {
  @IsOptional()
  score?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
