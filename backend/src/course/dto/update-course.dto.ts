import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, IsDate, IsBoolean, IsNumber, IsArray, IsObject } from "class-validator"
import { Type } from "class-transformer"

export class UpdateCourseDto {
  @ApiProperty({
    example: "Introduction to Computer Science",
    description: "Course title",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Title must be a string" })
  title?: string

  @ApiProperty({
    example: "An introductory course to computer science principles",
    description: "Course description",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string

  @ApiProperty({
    example: "CS101",
    description: "Course code",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Course code must be a string" })
  code?: string

  @ApiProperty({
    example: "6457b8e7a2c3e1234567890a",
    description: "Teacher ID",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Teacher ID must be a string" })
  teacherId?: string

  @ApiProperty({
    example: "6457b8e7a2c3e1234567890b",
    description: "Direction ID",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Direction ID must be a string" })
  directionId?: string

  @ApiProperty({
    example: "2023-09-01",
    description: "Course start date",
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "Start date must be a valid date" })
  startDate?: Date

  @ApiProperty({
    example: "2023-12-15",
    description: "Course end date",
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "End date must be a valid date" })
  endDate?: Date

  @ApiProperty({
    example: true,
    description: "Is the course active",
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: "isActive must be a boolean" })
  isActive?: boolean

  @ApiProperty({
    example: 3,
    description: "Course credits",
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Credits must be a number" })
  credits?: number

  @ApiProperty({
    example: ["Monday 10:00-12:00", "Wednesday 10:00-12:00"],
    description: "Course schedule",
    required: false,
  })
  @IsOptional()
  @IsArray({ message: "Schedule must be an array" })
  @IsString({ each: true, message: "Each schedule item must be a string" })
  schedule?: string[]

  @ApiProperty({
    example: 30,
    description: "Course capacity",
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Capacity must be a number" })
  capacity?: number

  @ApiProperty({
    example: { room: "A101", materials: ["Textbook", "Laptop"] },
    description: "Additional information about the course",
    required: false,
  })
  @IsOptional()
  @IsObject({ message: "Additional info must be an object" })
  additionalInfo?: Record<string, any>
}
