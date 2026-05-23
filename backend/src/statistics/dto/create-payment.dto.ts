import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsDate, IsOptional, IsObject } from "class-validator"
import { Type } from "class-transformer"
import { PaymentMethod, PaymentStatus } from "../entities/payment.entity"

export class CreatePaymentDto {
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
    example: 100.5,
    description: "Payment amount",
  })
  @IsNotEmpty({ message: "Amount is required" })
  @IsNumber({}, { message: "Amount must be a number" })
  amount: number

  @ApiProperty({
    example: "USD",
    description: "Currency code",
  })
  @IsNotEmpty({ message: "Currency is required" })
  @IsString({ message: "Currency must be a string" })
  currency: string

  @ApiProperty({
    example: "completed",
    description: "Payment status",
    enum: PaymentStatus,
  })
  @IsNotEmpty({ message: "Status is required" })
  @IsEnum(PaymentStatus, { message: "Invalid payment status" })
  status: PaymentStatus

  @ApiProperty({
    example: "card",
    description: "Payment method",
    enum: PaymentMethod,
  })
  @IsNotEmpty({ message: "Payment method is required" })
  @IsEnum(PaymentMethod, { message: "Invalid payment method" })
  method: PaymentMethod

  @ApiProperty({
    example: "2023-05-15T10:30:00Z",
    description: "Payment date",
  })
  @IsNotEmpty({ message: "Payment date is required" })
  @Type(() => Date)
  @IsDate({ message: "Payment date must be a valid date" })
  paymentDate: Date

  @ApiProperty({
    example: "2023-06-15T10:30:00Z",
    description: "Due date (optional)",
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "Due date must be a valid date" })
  dueDate?: Date

  @ApiProperty({
    example: "txn_12345678",
    description: "Transaction ID (optional)",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Transaction ID must be a string" })
  transactionId?: string

  @ApiProperty({
    example: { receipt_number: "R12345", notes: "First installment" },
    description: "Additional metadata (optional)",
    required: false,
  })
  @IsOptional()
  @IsObject({ message: "Metadata must be an object" })
  metadata?: Record<string, any>
}
