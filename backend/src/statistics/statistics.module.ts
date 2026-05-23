import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StatisticsService } from "./statistics.service";
import { StatisticsController } from "./statistics.controller";
import { Payment } from "./entities/payment.entity";
import { StudentMovement } from "./entities/student-movement.entity";
import { StudentModule } from "../student/student.module";
import { CourseModule } from "../course/course.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, StudentMovement]),
    StudentModule,
    CourseModule,
    AuthModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
