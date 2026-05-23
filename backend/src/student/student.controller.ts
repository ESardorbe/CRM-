import { Controller, Get, Post, Body, Param, Put, Patch, Delete, UseGuards, Query, Request } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import  { StudentService } from "./student.service"
import  { CreateStudentDto } from "./dto/create-student.dto"
import  { UpdateStudentDto } from "./dto/update-student.dto"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { Roles } from "../auth/decorator/roles.decorator"
import { Role } from "../auth/enums/role.enum"
import { RoleGuard } from "../auth/guards/role.guard"
import { GetCurrentUserId } from "../auth/decorator/get-current-user-id.decorator"

@ApiTags("Students")
@ApiBearerAuth()
@Controller("students")
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: "Get all students" })
  @ApiResponse({ status: 200, description: "Return all students" })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.studentService.findAll(Number(page) || 1, Number(limit) || 10, search)
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher, Role.Student)
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiResponse({ status: 200, description: 'Return the student' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Get('user/:userId')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher, Role.Student)
  @ApiOperation({ summary: 'Get a student by user ID' })
  @ApiResponse({ status: 200, description: 'Return the student' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findByUserId(@Param('userId') userId: string) {
    return this.studentService.findByUserId(userId);
  }

  @Patch("me")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Student)
  @ApiOperation({ summary: "Student updates own profile" })
  updateSelf(@GetCurrentUserId() userId: string, @Body() dto: UpdateStudentDto) {
    return this.studentService.updateByUserId(userId, dto);
  }

  @Put(":id")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: "Update a student" })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(id, updateStudentDto)
  }

  @Patch(":id")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: "Partial update a student" })
  partialUpdate(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(id, updateStudentDto)
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Delete a student' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  remove(@Param('id') id: string) {
    return this.studentService.remove(id);
  }

  @Post(":id/courses/:courseId")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: "Add a course to a student" })
  @ApiResponse({ status: 200, description: "Course added to student successfully" })
  @ApiResponse({ status: 404, description: "Student or course not found" })
  addCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.studentService.addCourse(id, courseId)
  }

  @Delete(":id/courses/:courseId")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: "Remove a course from a student" })
  @ApiResponse({ status: 200, description: "Course removed from student successfully" })
  @ApiResponse({ status: 404, description: "Student or course not found" })
  removeCourse(@Param('id') id: string, @Param('courseId') courseId: string) {
    return this.studentService.removeCourse(id, courseId)
  }
}
