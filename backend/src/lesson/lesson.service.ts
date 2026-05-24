import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Course } from '../course/entities/course.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';

const UZ_DAY_MAP: Record<string, string> = {
  dushanba: 'monday', seshanba: 'tuesday', chorshanba: 'wednesday',
  payshanba: 'thursday', juma: 'friday', shanba: 'saturday', yakshanba: 'sunday',
};

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly repo: Repository<Lesson>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async create(dto: CreateLessonDto): Promise<Lesson> {
    const lesson = this.repo.create({
      title: dto.title,
      description: dto.description ?? null,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isOnline: dto.isOnline ?? false,
      meetingLink: dto.meetingLink ?? null,
      room: dto.room ?? null,
      course: { id: dto.courseId } as any,
    });
    return this.repo.save(lesson);
  }

  async findByCourse(courseId: string): Promise<Lesson[]> {
    return this.repo.find({
      where: { course: { id: courseId } },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async update(id: string, dto: Partial<CreateLessonDto>): Promise<Lesson> {
    const lesson = await this.repo.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Dars topilmadi');
    Object.assign(lesson, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.dayOfWeek !== undefined && { dayOfWeek: dto.dayOfWeek }),
      ...(dto.startTime !== undefined && { startTime: dto.startTime }),
      ...(dto.endTime !== undefined && { endTime: dto.endTime }),
      ...(dto.isOnline !== undefined && { isOnline: dto.isOnline }),
      ...(dto.meetingLink !== undefined && { meetingLink: dto.meetingLink }),
      ...(dto.room !== undefined && { room: dto.room }),
    });
    return this.repo.save(lesson);
  }

  async remove(id: string): Promise<void> {
    const lesson = await this.repo.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Dars topilmadi');
    await this.repo.remove(lesson);
  }

  async migrateFromCourseSchedule(): Promise<{ migrated: number; skipped: number }> {
    const courses = await this.courseRepo.find({ select: ['id', 'title', 'schedule'] });
    let migrated = 0;
    let skipped = 0;

    for (const course of courses) {
      if (!course.schedule || course.schedule.length === 0) { skipped++; continue; }

      const existing = await this.repo.count({ where: { course: { id: course.id } } });
      if (existing > 0) { skipped++; continue; }

      for (const entry of course.schedule) {
        // "Dushanba 09:00-10:30" yoki "Chorshanba 14:00-15:30"
        const match = entry.match(/^(\S+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
        if (!match) continue;

        const [, dayName, startTime, endTime] = match;
        const dayOfWeek = UZ_DAY_MAP[dayName.toLowerCase()] ?? dayName.toLowerCase();

        const lesson = this.repo.create({
          course: { id: course.id } as any,
          title: `Dars - ${dayName}`,
          dayOfWeek,
          startTime,
          endTime,
          isOnline: false,
        });
        await this.repo.save(lesson);
        migrated++;
      }
    }

    return { migrated, skipped };
  }
}
