import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectionService } from './direction.service';
import { DirectionController } from './direction.controller';
import { Direction } from './entities/direction.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Direction]), AuthModule],
  controllers: [DirectionController],
  providers: [DirectionService],
  exports: [DirectionService],
})
export class DirectionModule {}
