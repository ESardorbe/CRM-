import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsDate, IsString, IsEnum, IsInt, Min, Max } from "class-validator"
import { Type } from "class-transformer"
import { MovementType } from "../entities/student-movement.entity"
import { PaymentStatus } from "../entities/payment.entity"

export class StatisticsQueryDto {
  @ApiProperty({
    example: "2023-01-01T00:00:00Z",
    description: "Start date for the statistics period",
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "Start date must be a valid date" })
  startDate?: Date

  @ApiProperty({
    example: "2023-12-31T23:59:59Z",
    description: "End date for the statistics period",
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "End date must be a valid date" })
  endDate?: Date

  @ApiProperty({
    example: "6457b8e7a2c3e1234567890b",
    description: "Filter by course ID",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Course ID must be a string" })
  courseId?: string

  @ApiProperty({
    example: "joined",
    description: "Filter by movement type",
    enum: MovementType,
    required: false,
  })
  @IsOptional()
  @IsEnum(MovementType, { message: "Invalid movement type" })
  movementType?: MovementType

  @ApiProperty({
    example: "completed",
    description: "Filter by payment status",
    enum: PaymentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus, { message: "Invalid payment status" })
  paymentStatus?: PaymentStatus

  @ApiProperty({
    example: 1,
    description: "Page number for pagination",
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Page must be an integer" })
  @Min(1, { message: "Page must be at least 1" })
  page?: number = 1

  @ApiProperty({
    example: 10,
    description: "Items per page for pagination",
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Limit must be an integer" })
  @Min(1, { message: "Limit must be at least 1" })
  @Max(100, { message: "Limit cannot exceed 100" })
  limit?: number = 10
}
