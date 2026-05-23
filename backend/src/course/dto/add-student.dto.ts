import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class AddStudentDto {
  @ApiProperty({
    example: "6457b8e7a2c3e1234567890a",
    description: "Student ID",
  })
  @IsNotEmpty({ message: "Student ID is required" })
  @IsString({ message: "Student ID must be a string" })
  studentId: string
}
