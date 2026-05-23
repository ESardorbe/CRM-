import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber, IsArray, IsObject } from "class-validator"

export class CreateCourseDto {
  @ApiProperty({
    example: "Introduction to Computer Science",
    description: "Course title",
  })
  @IsNotEmpty({ message: "Title is required" })
  @IsString({ message: "Title must be a string" })
  title: string

  @ApiProperty({
    example: "An introductory course to computer science principles",
    description: "Course description",
  })
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string

  @ApiProperty({
    example: "CS101",
    description: "Course code",
  })
  @IsOptional()
  @IsString({ message: "Course code must be a string" })
  code?: string

  @ApiProperty({
    example: "6457b8e7a2c3e1234567890a",
    description: "Teacher ID",
  })
  @IsOptional()
  @IsString({ message: "Teacher ID must be a string" })
  teacherId?: string

  @ApiProperty({
    example: "6457b8e7a2c3e1234567890b",
    description: "Direction ID",
  })
  @IsOptional()
  @IsString({ message: "Direction ID must be a string" })
  directionId?: string

  @ApiProperty({
    example: "2023-09-01",
    description: "Course start date",
  })
  @IsOptional()
  @IsString({ message: "Start date must be a valid date string" })
  startDate?: string

  @ApiProperty({
    example: "2023-12-15",
    description: "Course end date",
  })
  @IsOptional()
  @IsString({ message: "End date must be a valid date string" })
  endDate?: string

  @ApiProperty({
    example: true,
    description: "Is the course active",
  })
  @IsOptional()
  @IsBoolean({ message: "isActive must be a boolean" })
  isActive?: boolean

  @ApiProperty({
    example: 3,
    description: "Course credits",
  })
  @IsOptional()
  @IsNumber({}, { message: "Credits must be a number" })
  credits?: number

  @ApiProperty({
    example: ["Monday 10:00-12:00", "Wednesday 10:00-12:00"],
    description: "Course schedule",
  })
  @IsOptional()
  @IsArray({ message: "Schedule must be an array" })
  @IsString({ each: true, message: "Each schedule item must be a string" })
  schedule?: string[]

  @ApiProperty({
    example: 30,
    description: "Course capacity",
  })
  @IsOptional()
  @IsNumber({}, { message: "Capacity must be a number" })
  capacity?: number

  @ApiProperty({
    example: { room: "A101", materials: ["Textbook", "Laptop"] },
    description: "Additional information about the course",
  })
  @IsOptional()
  @IsObject({ message: "Additional info must be an object" })
  additionalInfo?: Record<string, any>
}
