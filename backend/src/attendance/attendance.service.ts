import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord } from './entities/attendance.entity';
import { BulkAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly repo: Repository<AttendanceRecord>,
  ) {}

  async saveBulk(dto: BulkAttendanceDto): Promise<AttendanceRecord[]> {
    return this.repo.manager.transaction(async (manager) => {
      const results: AttendanceRecord[] = [];
      for (const r of dto.records) {
        await manager.delete(AttendanceRecord, {
          student: { id: r.studentId } as any,
          course: { id: dto.courseId } as any,
          date: dto.date,
        });
        const record = manager.create(AttendanceRecord, {
          student: { id: r.studentId } as any,
          course: { id: dto.courseId } as any,
          date: dto.date,
          status: (r.status as any) ?? 'present',
          note: r.note,
        });
        results.push(await manager.save(record));
      }
      return results;
    });
  }

  async findByCourseAndDate(courseId: string, date: string): Promise<AttendanceRecord[]> {
    return this.repo.find({
      where: { course: { id: courseId } as any, date },
      relations: ['student', 'student.user'],
    });
  }

  async findByStudent(studentId: string): Promise<AttendanceRecord[]> {
    return this.repo.find({
      where: { student: { id: studentId } as any },
      relations: ['course'],
      order: { date: 'DESC' },
    });
  }

  async findAll(
    courseId?: string,
    date?: string,
    studentId?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: AttendanceRecord[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (courseId) where.course = { id: courseId };
    if (date) where.date = date;
    if (studentId) where.student = { id: studentId };
    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['student', 'student.user', 'course', 'course.direction', 'course.teacher', 'course.teacher.user'],
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
