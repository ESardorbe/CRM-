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
    const results: AttendanceRecord[] = [];
    for (const r of dto.records) {
      // upsert: delete existing then insert
      await this.repo.delete({
        student: { id: r.studentId } as any,
        course: { id: dto.courseId } as any,
        date: dto.date,
      });
      const record = this.repo.create({
        student: { id: r.studentId } as any,
        course: { id: dto.courseId } as any,
        date: dto.date,
        status: (r.status as any) ?? 'present',
        note: r.note,
      });
      results.push(await this.repo.save(record));
    }
    return results;
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

  async findAll(courseId?: string, date?: string, studentId?: string): Promise<AttendanceRecord[]> {
    const where: any = {};
    if (courseId) where.course = { id: courseId };
    if (date) where.date = date;
    if (studentId) where.student = { id: studentId };
    return this.repo.find({
      where,
      relations: ['student', 'student.user', 'course'],
      order: { date: 'DESC' },
    });
  }
}
