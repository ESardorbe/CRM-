import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TeacherService } from "./teacher.service";
import { TeacherController } from "./teacher.controller";
import { Teacher } from "./entities/teacher.entity";
import { User } from "../auth/entities/user.entity";
import { Direction } from "../direction/entities/direction.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, User, Direction])],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
