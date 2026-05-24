import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly repo: Repository<Material>,
  ) {}

  async create(dto: CreateMaterialDto, file: Express.Multer.File, userId: string): Promise<Material> {
    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    const fileType = this.resolveFileType(ext);

    const material = this.repo.create({
      title: dto.title,
      description: dto.description ?? null,
      fileUrl: `/uploads/${file.filename}`,
      fileName: file.originalname,
      fileType,
      course: { id: dto.courseId } as any,
      uploadedBy: { id: userId } as any,
    });

    return this.repo.save(material);
  }

  async findByCourse(courseId: string): Promise<Material[]> {
    return this.repo.find({
      where: { course: { id: courseId } },
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const material = await this.repo.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });
    if (!material) throw new NotFoundException('Material topilmadi');
    if (userRole !== 'admin' && userRole !== 'superadmin' && material.uploadedBy?.id !== userId) {
      throw new ForbiddenException('Faqat o\'z materialingizni o\'chira olasiz');
    }
    await this.repo.remove(material);
  }

  private resolveFileType(ext: string): string {
    if (['pdf'].includes(ext)) return 'pdf';
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) return 'document';
    return 'other';
  }
}
