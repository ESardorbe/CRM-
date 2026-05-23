import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, IsDate, IsBoolean, IsObject } from "class-validator"
import { Type } from "class-transformer"

export class UpdateTeacherDto {
  @IsOptional() @IsString() firstName?: string
  @IsOptional() @IsString() lastName?: string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsString() bio?: string
  @IsOptional() @IsString() avatarUrl?: string
  @IsOptional() @IsString() directionId?: string

  @IsOptional() @IsString() teacherId?: string
  @IsOptional() @Type(() => Date) @IsDate() hireDate?: Date
  @IsOptional() @IsBoolean() isActive?: boolean
  @IsOptional() @IsString() department?: string
  @IsOptional() @IsObject() additionalInfo?: Record<string, any>
}
