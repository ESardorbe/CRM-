import {
  Controller, Post, Get, Delete, Param, Query, Body, Req,
  UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { GetCurrentUserId } from '../auth/decorator/get-current-user-id.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RoleGuard } from '../auth/guards/role.guard';

const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const unique = uuidv4();
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@ApiTags('Materials')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin, Role.Teacher)
  @ApiOperation({ summary: 'Upload material (max 50MB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async create(
    @Body() dto: CreateMaterialDto,
    @UploadedFile(new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 })] }))
    file: Express.Multer.File,
    @GetCurrentUserId() userId: string,
  ) {
    return this.materialService.create(dto, file, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get materials by courseId' })
  async findByCourse(@Query('courseId') courseId: string) {
    return this.materialService.findByCourse(courseId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete material' })
  async remove(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
    @Req() req: Request,
  ) {
    const role = (req.user as any)?.role ?? '';
    return this.materialService.remove(id, userId, role);
  }
}
