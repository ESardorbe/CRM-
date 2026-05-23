import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourseService } from "./course.service";
import { CourseController } from "./course.controller";
import { Course } from "./entities/course.entity";
import { TeacherModule } from "../teacher/teacher.module";
import { StudentModule } from "../student/student.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    TeacherModule,
    StudentModule,
    AuthModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
