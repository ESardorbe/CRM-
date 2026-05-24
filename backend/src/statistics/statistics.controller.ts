import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import  { StatisticsService } from "./statistics.service"
import  { CreatePaymentDto } from "./dto/create-payment.dto"
import  { UpdatePaymentDto } from "./dto/update-payment.dto"
import  { CreateStudentMovementDto } from "./dto/create-student-movement.dto"
import  { StatisticsQueryDto } from "./dto/statistics-query.dto"
import  { MonthlyReportDto } from "./dto/monthly-report.dto"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { Roles } from "../auth/decorator/roles.decorator"
import { Role } from "../auth/enums/role.enum"
import { RoleGuard } from "../auth/guards/role.guard"

@ApiTags("Statistics")
@ApiBearerAuth()
@Controller("statistics")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // Dashboard statistics
  @Get("dashboard")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: "Get dashboard statistics" })
  @ApiResponse({ status: 200, description: "Return dashboard statistics" })
  getDashboardStatistics() {
    return this.statisticsService.getDashboardStatistics()
  }

  // Monthly registrations (students/teachers added per month)
  @Get("registrations")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher, Role.Moderator)
  @ApiOperation({ summary: "Get monthly student and teacher registration counts" })
  getMonthlyRegistrations(@Query('year') year?: string) {
    const y = year ? Number(year) : new Date().getFullYear();
    return this.statisticsService.getMonthlyRegistrations(y);
  }

  // Monthly reports
  @Get("monthly-report")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher, Role.Moderator)
  @ApiOperation({ summary: "Get monthly statistics report" })
  @ApiResponse({ status: 200, description: "Return monthly statistics" })
  getMonthlyReport(@Query() reportDto: MonthlyReportDto) {
    return this.statisticsService.getMonthlyReport(reportDto)
  }

  // Payment endpoints
  @Post("payments")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: "Create a new payment record" })
  @ApiResponse({ status: 201, description: "Payment created successfully" })
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.statisticsService.createPayment(createPaymentDto)
  }

  @Get("payments")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher, Role.Moderator)
  @ApiOperation({ summary: "Get all payments with filtering options" })
  @ApiResponse({ status: 200, description: "Return all payments" })
  findAllPayments(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.findAllPayments(query)
  }

  @Get("payments/:id")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher, Role.Moderator)
  @ApiOperation({ summary: "Get a payment by ID" })
  @ApiResponse({ status: 200, description: "Return the payment" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  findPaymentById(@Param("id") id: string) {
    return this.statisticsService.findPaymentById(id)
  }

  @Put("payments/:id")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: "Update a payment" })
  @ApiResponse({ status: 200, description: "Payment updated successfully" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  updatePayment(@Param("id") id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.statisticsService.updatePayment(id, updatePaymentDto)
  }

  @Delete("payments/:id")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: "Delete a payment" })
  @ApiResponse({ status: 200, description: "Payment deleted successfully" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  removePayment(@Param("id") id: string) {
    return this.statisticsService.removePayment(id)
  }

  // Student Movement endpoints
  @Post("student-movements")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: "Record a student joining or leaving a course" })
  @ApiResponse({ status: 201, description: "Student movement recorded successfully" })
  createStudentMovement(@Body() createStudentMovementDto: CreateStudentMovementDto) {
    return this.statisticsService.createStudentMovement(createStudentMovementDto)
  }

  @Get("student-movements")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher, Role.Moderator)
  @ApiOperation({ summary: "Get all student movements with filtering options" })
  @ApiResponse({ status: 200, description: "Return all student movements" })
  findAllStudentMovements(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.findAllStudentMovements(query)
  }
}
