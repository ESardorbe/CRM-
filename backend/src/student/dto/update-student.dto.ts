import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, IsDate, IsBoolean, IsObject } from "class-validator"
import { Type } from "class-transformer"

export class UpdateStudentDto {
  @IsOptional() @IsString() firstName?: string
  @IsOptional() @IsString() lastName?: string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsString() avatarUrl?: string

  @IsOptional() @IsString() parentName?: string
  @IsOptional() @IsString() parentPhone?: string
  @IsOptional() @IsString() courseId?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString() studentId?: string

  @ApiProperty({ required: false })
  @IsOptional() @Type(() => Date) @IsDate() enrollmentDate?: Date

  @ApiProperty({ required: false })
  @IsOptional() @IsBoolean() isActive?: boolean

  @ApiProperty({ required: false })
  @IsOptional() @IsString() grade?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsString() major?: string

  @ApiProperty({ required: false })
  @IsOptional() @IsObject() additionalInfo?: Record<string, any>
}
