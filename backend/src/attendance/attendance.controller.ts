import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto } from './dto/create-attendance.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RoleGuard } from '../auth/guards/role.guard';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post('bulk')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Teacher, Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Save bulk attendance for a course session' })
  saveBulk(@Body() dto: BulkAttendanceDto) {
    return this.service.saveBulk(dto);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Teacher, Role.Admin, Role.SuperAdmin, Role.Student)
  @ApiOperation({ summary: 'Get attendance records (filter by courseId, date, studentId)' })
  findAll(
    @Query('courseId') courseId?: string,
    @Query('date') date?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.service.findAll(courseId, date, studentId);
  }
}
