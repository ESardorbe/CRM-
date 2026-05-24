import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private readonly repo: Repository<Grade>,
  ) {}

  async create(dto: CreateGradeDto, gradedById: string): Promise<Grade> {
    const grade = this.repo.create({
      score: dto.score,
      maxScore: dto.maxScore ?? 100,
      gradeType: dto.gradeType ?? 'midterm',
      comment: dto.comment ?? null,
      student: { id: dto.studentId } as any,
      course: { id: dto.courseId } as any,
      gradedBy: { id: gradedById } as any,
    });
    return this.repo.save(grade);
  }

  async findByCourse(courseId: string): Promise<Grade[]> {
    return this.repo.find({
      where: { course: { id: courseId } },
      relations: ['student', 'student.user', 'gradedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: string): Promise<Grade[]> {
    return this.repo.find({
      where: { student: { id: studentId } },
      relations: ['course', 'gradedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: Partial<CreateGradeDto>): Promise<Grade> {
    const grade = await this.repo.findOne({ where: { id } });
    if (!grade) throw new NotFoundException('Baho topilmadi');
    Object.assign(grade, {
      ...(dto.score !== undefined && { score: dto.score }),
      ...(dto.maxScore !== undefined && { maxScore: dto.maxScore }),
      ...(dto.gradeType !== undefined && { gradeType: dto.gradeType }),
      ...(dto.comment !== undefined && { comment: dto.comment }),
    });
    return this.repo.save(grade);
  }

  async remove(id: string): Promise<void> {
    const grade = await this.repo.findOne({ where: { id } });
    if (!grade) throw new NotFoundException('Baho topilmadi');
    await this.repo.remove(grade);
  }

  async getCourseSummary(courseId: string): Promise<{ studentId: string; name: string; average: number; count: number }[]> {
    const grades = await this.repo.find({
      where: { course: { id: courseId } },
      relations: ['student', 'student.user'],
    });
    const byStudent = new Map<string, { name: string; scores: number[] }>();
    for (const g of grades) {
      const sid = g.student.id;
      const name = `${(g.student as any).user?.firstName ?? ''} ${(g.student as any).user?.lastName ?? ''}`.trim();
      if (!byStudent.has(sid)) byStudent.set(sid, { name, scores: [] });
      byStudent.get(sid)!.scores.push(Number(g.score));
    }
    return Array.from(byStudent.entries()).map(([studentId, { name, scores }]) => ({
      studentId,
      name,
      average: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      count: scores.length,
    }));
  }
}
