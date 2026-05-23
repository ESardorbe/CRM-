import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Teacher } from "./entities/teacher.entity";
import { User } from "../auth/entities/user.entity";
import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateTeacherDto): Promise<Teacher> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new HttpException("Bu email allaqachon mavjud", HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName ?? "",
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
      role: "teacher",
      isVerify: true,
    });
    await this.userRepository.save(user);

    const teacher = this.teacherRepository.create({
      user,
      bio: dto.bio,
      teacherId: `TCH${Date.now()}`,
      hireDate: new Date(),
    });

    if (dto.directionId) {
      teacher.direction = { id: dto.directionId } as any;
    }

    return this.teacherRepository.save(teacher);
  }

  async findAll(page = 1, limit = 10): Promise<{ data: Teacher[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.teacherRepository.findAndCount({
      relations: ["user", "courses", "direction"],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ["user", "courses", "direction"],
    });
    if (!teacher) throw new HttpException("Teacher not found", HttpStatus.NOT_FOUND);
    return teacher;
  }

  async findByUserId(userId: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user", "courses", "direction"],
    });
    if (!teacher) throw new HttpException("Teacher not found", HttpStatus.NOT_FOUND);
    return teacher;
  }

  async updateByUserId(userId: string, dto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ where: { user: { id: userId } }, relations: ["user", "direction"] });
    if (!teacher) throw new HttpException("Teacher not found", HttpStatus.NOT_FOUND);
    return this.update(teacher.id, dto);
  }

  async update(id: string, dto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ where: { id }, relations: ["user", "direction"] });
    if (!teacher) throw new HttpException("Teacher not found", HttpStatus.NOT_FOUND);

    const { firstName, lastName, phone, bio, avatarUrl, directionId, ...teacherFields } = dto as any;

    if (firstName !== undefined) teacher.user.firstName = firstName;
    if (lastName !== undefined) teacher.user.lastName = lastName;
    if (phone !== undefined) teacher.user.phone = phone;
    if (avatarUrl !== undefined) teacher.user.avatarUrl = avatarUrl;
    await this.userRepository.save(teacher.user);

    if (bio !== undefined) teacher.bio = bio;
    if (directionId !== undefined) {
      teacher.direction = directionId ? ({ id: directionId } as any) : null;
    }

    Object.assign(teacher, teacherFields);
    return this.teacherRepository.save(teacher);
  }

  async remove(id: string): Promise<{ message: string }> {
    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (!teacher) throw new HttpException("Teacher not found", HttpStatus.NOT_FOUND);
    await this.teacherRepository.delete(id);
    return { message: "Teacher deleted successfully" };
  }

  async addCourse(teacherId: string, courseId: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ["courses"],
    });
    if (!teacher) throw new HttpException("Teacher not found", HttpStatus.NOT_FOUND);
    if (teacher.courses?.some((c) => c.id === courseId)) {
      throw new HttpException("Teacher is already assigned to this course", HttpStatus.BAD_REQUEST);
    }
    if (!teacher.courses) teacher.courses = [];
    teacher.courses.push({ id: courseId } as any);
    return this.teacherRepository.save(teacher);
  }

  async removeCourse(teacherId: string, courseId: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ["courses"],
    });
    if (!teacher) throw new HttpException("Teacher not found", HttpStatus.NOT_FOUND);
    if (!teacher.courses?.some((c) => c.id === courseId)) {
      throw new HttpException("Teacher is not assigned to this course", HttpStatus.BAD_REQUEST);
    }
    teacher.courses = teacher.courses.filter((c) => c.id !== courseId);
    return this.teacherRepository.save(teacher);
  }
}
