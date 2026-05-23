import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Direction } from './entities/direction.entity';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UpdateDirectionDto } from './dto/update-direction.dto';

@Injectable()
export class DirectionService {
  constructor(
    @InjectRepository(Direction)
    private readonly directionRepository: Repository<Direction>,
  ) {}

  async findAll(page = 1, limit = 50): Promise<{ data: Direction[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.directionRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Direction> {
    const direction = await this.directionRepository.findOne({ where: { id } });
    if (!direction) {
      throw new HttpException('Direction not found', HttpStatus.NOT_FOUND);
    }
    return direction;
  }

  async create(dto: CreateDirectionDto): Promise<Direction> {
    const existing = await this.directionRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new HttpException('Bu nomli yo\'nalish allaqachon mavjud', HttpStatus.BAD_REQUEST);
    }
    const direction = this.directionRepository.create(dto);
    return this.directionRepository.save(direction);
  }

  async update(id: string, dto: UpdateDirectionDto): Promise<Direction> {
    const direction = await this.findOne(id);
    Object.assign(direction, dto);
    return this.directionRepository.save(direction);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.directionRepository.delete(id);
    return { message: 'Direction deleted successfully' };
  }
}
