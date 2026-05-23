import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, IsEmail } from "class-validator"

export class CreateStudentDto {
  @ApiProperty({ example: "Ibrohim" })
  @IsNotEmpty()
  @IsString()
  firstName: string

  @ApiProperty({ example: "Karimov", required: false })
  @IsOptional()
  @IsString()
  lastName?: string

  @ApiProperty({ example: "student@example.com" })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ example: "+998901234567", required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ example: "password123" })
  @IsNotEmpty()
  @IsString()
  password: string

  @ApiProperty({ example: "Karimov Abdulla", required: false })
  @IsOptional()
  @IsString()
  parentName?: string

  @ApiProperty({ example: "+998901234567", required: false })
  @IsOptional()
  @IsString()
  parentPhone?: string

  @ApiProperty({ example: "Matematika", required: false })
  @IsOptional()
  @IsString()
  courseId?: string
}
