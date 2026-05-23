import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DirectionService } from './direction.service';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UpdateDirectionDto } from './dto/update-direction.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RoleGuard } from '../auth/guards/role.guard';

@ApiTags('Directions')
@ApiBearerAuth()
@Controller('directions')
export class DirectionController {
  constructor(private readonly directionService: DirectionService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get all directions' })
  @ApiResponse({ status: 200, description: 'Return all directions' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.directionService.findAll(Number(page) || 1, Number(limit) || 50);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get direction by ID' })
  @ApiResponse({ status: 200, description: 'Return the direction' })
  @ApiResponse({ status: 404, description: 'Direction not found' })
  findOne(@Param('id') id: string) {
    return this.directionService.findOne(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Create a new direction' })
  @ApiResponse({ status: 201, description: 'Direction created successfully' })
  create(@Body() dto: CreateDirectionDto) {
    return this.directionService.create(dto);
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Update a direction' })
  @ApiResponse({ status: 200, description: 'Direction updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateDirectionDto) {
    return this.directionService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({ summary: 'Delete a direction' })
  @ApiResponse({ status: 200, description: 'Direction deleted successfully' })
  remove(@Param('id') id: string) {
    return this.directionService.remove(id);
  }
}
