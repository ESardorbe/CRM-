import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsEnum, IsDate, IsOptional } from "class-validator"
import { Type } from "class-transformer"
import { MovementType } from "../entities/student-movement.entity"

export class CreateStudentMovementDto {
  @ApiProperty({
    example: "6457b8e7a2c3e1234567890a",
    description: "Student ID",
  })
  @IsNotEmpty({ message: "Student ID is required" })
  @IsString({ message: "Student ID must be a string" })
  studentId: string

  @ApiProperty({
    example: "6457b8e7a2c3e1234567890b",
    description: "Course ID",
  })
  @IsNotEmpty({ message: "Course ID is required" })
  @IsString({ message: "Course ID must be a string" })
  courseId: string

  @ApiProperty({
    example: "joined",
    description: "Movement type (joined or left)",
    enum: MovementType,
  })
  @IsNotEmpty({ message: "Movement type is required" })
  @IsEnum(MovementType, { message: "Invalid movement type" })
  type: MovementType

  @ApiProperty({
    example: "2023-05-15T10:30:00Z",
    description: "Movement date",
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "Date must be a valid date" })
  date?: Date

  @ApiProperty({
    example: "Transferred from another course",
    description: "Reason for the movement (optional)",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Reason must be a string" })
  reason?: string
}
