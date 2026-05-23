import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
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
import { TeacherService } from "./teacher.service";
import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { Role } from "../auth/enums/role.enum";
import { RoleGuard } from "../auth/guards/role.guard";
import { GetCurrentUserId } from "../auth/decorator/get-current-user-id.decorator";

@ApiTags("Teachers")
@ApiBearerAuth()
@Controller("teachers")
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: "Create a new teacher" })
  @ApiResponse({ status: 201, description: "Teacher created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @ApiOperation({ summary: "Get all teachers" })
  @ApiResponse({ status: 200, description: "Return all teachers" })
  @Get()
  @UseGuards(AccessTokenGuard)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.teacherService.findAll(Number(page) || 1, Number(limit) || 10);
  }

  @Get(":id")
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: "Get a teacher by ID" })
  @ApiResponse({ status: 200, description: "Return the teacher" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  findOne(@Param("id") id: string) {
    return this.teacherService.findOne(id);
  }

  @Get("user/:userId")
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: "Get a teacher by user ID" })
  @ApiResponse({ status: 200, description: "Return the teacher" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  findByUserId(@Param("userId") userId: string) {
    return this.teacherService.findByUserId(userId);
  }

  @Patch("me")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Teacher)
  @ApiOperation({ summary: "Teacher updates own profile" })
  updateSelf(@GetCurrentUserId() userId: string, @Body() dto: UpdateTeacherDto) {
    return this.teacherService.updateByUserId(userId, dto);
  }

  @Put(":id")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: "Update a teacher" })
  @ApiResponse({ status: 200, description: "Teacher updated successfully" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  update(@Param("id") id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teacherService.update(id, updateTeacherDto);
  }

  @Delete(":id")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: "Delete a teacher" })
  @ApiResponse({ status: 200, description: "Teacher deleted successfully" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  remove(@Param("id") id: string) {
    return this.teacherService.remove(id);
  }

  @Post(":id/courses/:courseId")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: "Add a course to a teacher" })
  @ApiResponse({
    status: 200,
    description: "Course added to teacher successfully",
  })
  @ApiResponse({ status: 404, description: "Teacher or course not found" })
  addCourse(@Param("id") id: string, @Param("courseId") courseId: string) {
    return this.teacherService.addCourse(id, courseId);
  }

  @Delete(":id/courses/:courseId")
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: "Remove a course from a teacher" })
  @ApiResponse({
    status: 200,
    description: "Course removed from teacher successfully",
  })
  @ApiResponse({ status: 404, description: "Teacher or course not found" })
  removeCourse(@Param("id") id: string, @Param("courseId") courseId: string) {
    return this.teacherService.removeCourse(id, courseId);
  }
}
