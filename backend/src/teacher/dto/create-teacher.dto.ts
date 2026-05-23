import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, IsEmail } from "class-validator"

export class CreateTeacherDto {
  @IsNotEmpty() @IsString()
  firstName: string

  @IsOptional() @IsString()
  lastName?: string

  @IsNotEmpty() @IsEmail()
  email: string

  @IsOptional() @IsString()
  phone?: string

  @IsNotEmpty() @IsString()
  password: string

  @ApiProperty({ example: "uuid-of-direction", required: false })
  @IsOptional() @IsString()
  directionId?: string

  @IsOptional() @IsString()
  bio?: string
}
