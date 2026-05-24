import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Material } from './entities/material.entity';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material]),
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialsModule {}
