import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty } from "class-validator"
import { Role } from "../enums/role.enum"

export class UpdateRoleDto {
  @ApiProperty({
    example: "student",
    description: "User role",
    enum: Role,
  })
  @IsNotEmpty({ message: "Role cannot be empty" })
  @IsEnum(Role, { message: "Invalid role" })
  role: Role
}
