import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Assignment } from './entities/assignment.entity';
import { Submission } from './entities/submission.entity';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment, Submission]),
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
