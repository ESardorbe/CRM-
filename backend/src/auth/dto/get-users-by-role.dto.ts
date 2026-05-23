import { ApiProperty } from "@nestjs/swagger"
import { IsEnum } from "class-validator"
import { Role } from "../enums/role.enum"

export class GetUsersByRoleDto {
  @ApiProperty({
    example: "student",
    description: "Filter users by role",
    enum: Role,
  })
  @IsEnum(Role, { message: "Invalid role" })
  role: Role
}
