import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Submission } from './entities/submission.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CreateSubmissionDto, GradeSubmissionDto } from './dto/create-submission.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment) private assignRepo: Repository<Assignment>,
    @InjectRepository(Submission) private subRepo: Repository<Submission>,
  ) {}

  async createAssignment(dto: CreateAssignmentDto, userId: string): Promise<Assignment> {
    const assignment = this.assignRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      maxScore: dto.maxScore ?? 100,
      course: { id: dto.courseId } as any,
      createdBy: { id: userId } as any,
    });
    return this.assignRepo.save(assignment);
  }

  async findByCourse(courseId: string): Promise<Assignment[]> {
    return this.assignRepo.find({
      where: { course: { id: courseId } },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateAssignment(id: string, dto: Partial<CreateAssignmentDto>): Promise<Assignment> {
    const assignment = await this.assignRepo.findOne({ where: { id } });
    if (!assignment) throw new NotFoundException('Topshiriq topilmadi');
    Object.assign(assignment, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
      ...(dto.maxScore !== undefined && { maxScore: dto.maxScore }),
    });
    return this.assignRepo.save(assignment);
  }

  async removeAssignment(id: string): Promise<void> {
    const assignment = await this.assignRepo.findOne({ where: { id } });
    if (!assignment) throw new NotFoundException('Topshiriq topilmadi');
    await this.assignRepo.remove(assignment);
  }

  async submit(dto: CreateSubmissionDto, studentId: string, fileUrl?: string): Promise<Submission> {
    const existing = await this.subRepo.findOne({
      where: { assignment: { id: dto.assignmentId }, student: { id: studentId } },
    });
    if (existing) {
      existing.comment = dto.comment ?? null;
      if (fileUrl) existing.fileUrl = fileUrl;
      return this.subRepo.save(existing);
    }
    const submission = this.subRepo.create({
      comment: dto.comment ?? null,
      fileUrl: fileUrl ?? null,
      assignment: { id: dto.assignmentId } as any,
      student: { id: studentId } as any,
    });
    return this.subRepo.save(submission);
  }

  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    return this.subRepo.find({
      where: { assignment: { id: assignmentId } },
      relations: ['student', 'student.user'],
      order: { submittedAt: 'ASC' },
    });
  }

  async getMySubmission(assignmentId: string, studentId: string): Promise<Submission | null> {
    return this.subRepo.findOne({
      where: { assignment: { id: assignmentId }, student: { id: studentId } },
    });
  }

  async grade(submissionId: string, dto: GradeSubmissionDto): Promise<Submission> {
    const submission = await this.subRepo.findOne({ where: { id: submissionId } });
    if (!submission) throw new ForbiddenException('Topshiriq topilmadi');
    submission.score = dto.score ?? null;
    submission.feedback = dto.feedback ?? null;
    return this.subRepo.save(submission);
  }
}
