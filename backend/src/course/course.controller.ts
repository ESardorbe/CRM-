import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { AddStudentDto } from "./dto/add-student.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { Role } from "../auth/enums/role.enum";
import { RoleGuard } from "../auth/guards/role.guard";

@ApiTags("Courses")
@ApiBearerAuth()
@Controller("courses")
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: "Create a new course" })
  @ApiResponse({ status: 201, description: "Course created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: "Get all courses" })
  @ApiResponse({ status: 200, description: "Return all courses" })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: string,
  ) {
    return this.courseService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      isActive !== undefined ? isActive === 'true' : undefined,
    );
  }

  @Get(":id")
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: "Get a course by ID" })
  @ApiResponse({ status: 200, description: "Return the course" })
  @ApiResponse({ status: 404, description: "Course not found" })
  findOne(@Param("id") id: string) {
    return this.courseService.findOne(id);
  }

  @Put(":id")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: "Update a course" })
  @ApiResponse({ status: 200, description: "Course updated successfully" })
  @ApiResponse({ status: 404, description: "Course not found" })
  update(@Param("id") id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(":id")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: "Delete a course" })
  @ApiResponse({ status: 200, description: "Course deleted successfully" })
  @ApiResponse({ status: 404, description: "Course not found" })
  remove(@Param("id") id: string) {
    return this.courseService.remove(id);
  }

  @Post(":id/students")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: "Add a student to a course" })
  @ApiResponse({
    status: 200,
    description: "Student added to course successfully",
  })
  @ApiResponse({ status: 404, description: "Course or student not found" })
  addStudent(@Param("id") id: string, @Body() addStudentDto: AddStudentDto) {
    return this.courseService.addStudent(id, addStudentDto.studentId);
  }

  @Delete(":id/students/:studentId")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: "Remove a student from a course" })
  @ApiResponse({
    status: 200,
    description: "Student removed from course successfully",
  })
  @ApiResponse({ status: 404, description: "Course or student not found" })
  removeStudent(
    @Param("id") id: string,
    @Param("studentId") studentId: string
  ) {
    return this.courseService.removeStudent(id, studentId);
  }

  @Get("teacher/:teacherId")
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: "Get all courses for a specific teacher" })
  @ApiResponse({
    status: 200,
    description: "Return all courses for the teacher",
  })
  getTeacherCourses(@Param("teacherId") teacherId: string) {
    return this.courseService.getTeacherCourses(teacherId);
  }

  @Get("student/:studentId")
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: "Get all courses for a specific student" })
  @ApiResponse({
    status: 200,
    description: "Return all courses for the student",
  })
  getStudentCourses(@Param("studentId") studentId: string) {
    return this.courseService.getStudentCourses(studentId);
  }
}
