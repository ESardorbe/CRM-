import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { StudentModule } from "./student/student.module";
import { TeacherModule } from "./teacher/teacher.module";
import { CourseModule } from "./course/course.module";
import { StatisticsModule } from "./statistics/statistics.module";
import { DirectionModule } from "./direction/direction.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { AttendanceRecord } from "./attendance/entities/attendance.entity";
import { User } from "./auth/entities/user.entity";
import { Student } from "./student/entities/student.entity";
import { Teacher } from "./teacher/entities/teacher.entity";
import { Course } from "./course/entities/course.entity";
import { Payment } from "./statistics/entities/payment.entity";
import { StudentMovement } from "./statistics/entities/student-movement.entity";
import { Direction } from "./direction/entities/direction.entity";
import { MaterialsModule } from "./materials/material.module";
import { Material } from "./materials/entities/material.entity";
import { LessonModule } from "./lesson/lesson.module";
import { Lesson } from "./lesson/entities/lesson.entity";
import { AssignmentModule } from "./assignment/assignment.module";
import { Assignment } from "./assignment/entities/assignment.entity";
import { Submission } from "./assignment/entities/submission.entity";
import { GradeModule } from "./grade/grade.module";
import { Grade } from "./grade/entities/grade.entity";
import { NotificationsModule } from "./notifications/notifications.module";
import { Notification } from "./notifications/entities/notification.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 5432),
        username: configService.get<string>("DB_USERNAME", "postgres"),
        password: configService.get<string>("DB_PASSWORD", "postgres"),
        database: configService.get<string>("DB_DATABASE", "crm_db"),
        entities: [User, Student, Teacher, Course, Payment, StudentMovement, Direction, AttendanceRecord, Material, Lesson, Assignment, Submission, Grade, Notification],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: false,
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    AuthModule,
    StudentModule,
    TeacherModule,
    CourseModule,
    StatisticsModule,
    DirectionModule,
    AttendanceModule,
    MaterialsModule,
    LessonModule,
    AssignmentModule,
    GradeModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
