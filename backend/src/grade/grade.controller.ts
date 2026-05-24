import { Controller, Post, Get, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GradeService } from './grade.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { GetCurrentUserId } from '../auth/decorator/get-current-user-id.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RoleGuard } from '../auth/guards/role.guard';

@ApiTags('Grades')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Add grade for student' })
  create(@Body() dto: CreateGradeDto, @GetCurrentUserId() userId: string) {
    return this.gradeService.create(dto, userId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all grades for a course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.gradeService.findByCourse(courseId);
  }

  @Get('course/:courseId/summary')
  @ApiOperation({ summary: 'Get grade summary per student for a course' })
  getCourseSummary(@Param('courseId') courseId: string) {
    return this.gradeService.getCourseSummary(courseId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get grades for a student' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.gradeService.findByStudent(studentId);
  }

  @Put(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Update grade' })
  update(@Param('id') id: string, @Body() dto: CreateGradeDto) {
    return this.gradeService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Delete grade' })
  remove(@Param('id') id: string) {
    return this.gradeService.remove(id);
  }
}
