import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsNumber, IsString, IsEnum, IsDate, IsObject } from "class-validator"
import { Type } from "class-transformer"
import { PaymentMethod, PaymentStatus } from "../entities/payment.entity"

export class UpdatePaymentDto {
  @ApiProperty({
    example: 100.5,
    description: "Payment amount",
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Amount must be a number" })
  amount?: number

  @ApiProperty({
    example: "USD",
    description: "Currency code",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Currency must be a string" })
  currency?: string

  @ApiProperty({
    example: "completed",
    description: "Payment status",
    enum: PaymentStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus, { message: "Invalid payment status" })
  status?: PaymentStatus

  @ApiProperty({
    example: "card",
    description: "Payment method",
    enum: PaymentMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: "Invalid payment method" })
  method?: PaymentMethod

  @ApiProperty({
    example: "2023-05-15T10:30:00Z",
    description: "Payment date",
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "Payment date must be a valid date" })
  paymentDate?: Date

  @ApiProperty({
    example: "2023-06-15T10:30:00Z",
    description: "Due date",
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "Due date must be a valid date" })
  dueDate?: Date

  @ApiProperty({
    example: "txn_12345678",
    description: "Transaction ID",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Transaction ID must be a string" })
  transactionId?: string

  @ApiProperty({
    example: { receipt_number: "R12345", notes: "First installment" },
    description: "Additional metadata",
    required: false,
  })
  @IsOptional()
  @IsObject({ message: "Metadata must be an object" })
  metadata?: Record<string, any>
}
