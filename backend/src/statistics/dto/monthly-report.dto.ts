import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, IsInt, Min, Max } from "class-validator"
import { Type } from "class-transformer"

export class MonthlyReportDto {
  @ApiProperty({
    example: 2023,
    description: "Year for the monthly report",
  })
  @IsNotEmpty({ message: "Year is required" })
  @Type(() => Number)
  @IsInt({ message: "Year must be an integer" })
  @Min(2000, { message: "Year must be at least 2000" })
  @Max(2100, { message: "Year cannot exceed 2100" })
  year: number

  @ApiProperty({
    example: 5,
    description: "Month for the report (1-12)",
  })
  @IsNotEmpty({ message: "Month is required" })
  @Type(() => Number)
  @IsInt({ message: "Month must be an integer" })
  @Min(1, { message: "Month must be between 1 and 12" })
  @Max(12, { message: "Month must be between 1 and 12" })
  month: number

  @ApiProperty({
    example: "6457b8e7a2c3e1234567890b",
    description: "Filter by course ID (optional)",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Course ID must be a string" })
  courseId?: string
}
