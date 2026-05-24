import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StatisticsService } from "./statistics.service";
import { StatisticsController } from "./statistics.controller";
import { Payment } from "./entities/payment.entity";
import { StudentMovement } from "./entities/student-movement.entity";
import { Student } from "../student/entities/student.entity";
import { Teacher } from "../teacher/entities/teacher.entity";
import { StudentModule } from "../student/student.module";
import { CourseModule } from "../course/course.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, StudentMovement, Student, Teacher]),
    StudentModule,
    CourseModule,
    AuthModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
