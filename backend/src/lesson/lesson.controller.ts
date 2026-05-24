import { Controller, Post, Get, Put, Delete, Param, Query, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RoleGuard } from '../auth/guards/role.guard';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Create lesson for a course' })
  create(@Body() dto: CreateLessonDto) {
    return this.lessonService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get lessons by courseId' })
  findByCourse(@Query('courseId') courseId: string) {
    return this.lessonService.findByCourse(courseId);
  }

  @Put(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Update lesson' })
  update(@Param('id') id: string, @Body() dto: CreateLessonDto) {
    return this.lessonService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Delete lesson' })
  remove(@Param('id') id: string) {
    return this.lessonService.remove(id);
  }

  @Post('migrate-schedules')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @HttpCode(200)
  @ApiOperation({ summary: 'Migrate course.schedule[] strings to Lesson records' })
  migrateSchedules() {
    return this.lessonService.migrateFromCourseSchedule();
  }
}
