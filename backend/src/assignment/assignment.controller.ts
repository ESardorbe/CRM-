import {
  Controller, Post, Get, Put, Delete, Patch,
  Param, Query, Body, Req, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CreateSubmissionDto, GradeSubmissionDto } from './dto/create-submission.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { GetCurrentUserId } from '../auth/decorator/get-current-user-id.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RoleGuard } from '../auth/guards/role.guard';

const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${extname(file.originalname)}`),
});

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Create assignment' })
  create(@Body() dto: CreateAssignmentDto, @GetCurrentUserId() userId: string) {
    return this.assignmentService.createAssignment(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get assignments by courseId' })
  findByCourse(@Query('courseId') courseId: string) {
    return this.assignmentService.findByCourse(courseId);
  }

  @Put(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Update assignment' })
  update(@Param('id') id: string, @Body() dto: CreateAssignmentDto) {
    return this.assignmentService.updateAssignment(id, dto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Delete assignment' })
  remove(@Param('id') id: string) {
    return this.assignmentService.removeAssignment(id);
  }

  @Post(':id/submit')
  @UseInterceptors(FileInterceptor('file', { storage }))
  @ApiOperation({ summary: 'Student submits assignment' })
  async submit(
    @Param('id') assignmentId: string,
    @Body() dto: CreateSubmissionDto,
    @GetCurrentUserId() userId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    const studentId = (req.user as any)?.studentId ?? userId;
    const fileUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.assignmentService.submit(
      { ...dto, assignmentId },
      studentId,
      fileUrl,
    );
  }

  @Get(':id/submissions')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Get all submissions for assignment' })
  getSubmissions(@Param('id') assignmentId: string) {
    return this.assignmentService.getSubmissions(assignmentId);
  }

  @Patch('submissions/:submissionId/grade')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Grade a submission' })
  grade(@Param('submissionId') submissionId: string, @Body() dto: GradeSubmissionDto) {
    return this.assignmentService.grade(submissionId, dto);
  }
}
