import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Student } from "./entities/student.entity";
import { User } from "../auth/entities/user.entity";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
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
      role: "student",
      isVerify: true,
    });
    await this.userRepository.save(user);

    const student = this.studentRepository.create({
      user,
      parentName: dto.parentName,
      parentPhone: dto.parentPhone,
      studentId: `ST${Date.now()}`,
      enrollmentDate: new Date(),
    });

    if (dto.courseId) {
      student.courses = [{ id: dto.courseId } as any];
    }

    return this.studentRepository.save(student);
  }

  async findAll(page = 1, limit = 10, search?: string): Promise<{ data: Student[]; total: number; page: number; limit: number }> {
    const qb = this.studentRepository
      .createQueryBuilder("student")
      .leftJoinAndSelect("student.user", "user")
      .leftJoinAndSelect("student.courses", "courses");

    if (search) {
      qb.where(
        "LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search",
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("student.createdAt", "DESC")
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ["user", "courses"],
    });
    if (!student) {
      throw new HttpException("Student not found", HttpStatus.NOT_FOUND);
    }
    return student;
  }

  async findByUserId(userId: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user", "courses"],
    });
    if (!student) {
      throw new HttpException("Student not found", HttpStatus.NOT_FOUND);
    }
    return student;
  }

  async updateByUserId(userId: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { user: { id: userId } }, relations: ["user"] });
    if (!student) throw new HttpException("Student not found", HttpStatus.NOT_FOUND);
    return this.update(student.id, dto);
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { id }, relations: ["user", "courses"] });
    if (!student) throw new HttpException("Student not found", HttpStatus.NOT_FOUND);

    const { firstName, lastName, phone, avatarUrl, courseId, ...studentFields } = dto as any;

    if (firstName !== undefined) student.user.firstName = firstName;
    if (lastName !== undefined) student.user.lastName = lastName;
    if (phone !== undefined) student.user.phone = phone;
    if (avatarUrl !== undefined) student.user.avatarUrl = avatarUrl;
    await this.userRepository.save(student.user);

    if (courseId !== undefined) {
      student.courses = courseId ? [{ id: courseId } as any] : [];
    }

    if (studentFields.parentName !== undefined) student.parentName = studentFields.parentName;
    if (studentFields.parentPhone !== undefined) student.parentPhone = studentFields.parentPhone;

    const { parentName, parentPhone, ...rest } = studentFields;
    Object.assign(student, rest);
    return this.studentRepository.save(student);
  }

  async remove(id: string): Promise<{ message: string }> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new HttpException("Student not found", HttpStatus.NOT_FOUND);
    }
    await this.studentRepository.delete(id);
    return { message: "Student deleted successfully" };
  }

  async addCourse(studentId: string, courseId: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ["courses"],
    });
    if (!student) throw new HttpException("Student not found", HttpStatus.NOT_FOUND);
    if (student.courses?.some((c) => c.id === courseId)) {
      throw new HttpException("Student already enrolled", HttpStatus.BAD_REQUEST);
    }
    if (!student.courses) student.courses = [];
    student.courses.push({ id: courseId } as any);
    return this.studentRepository.save(student);
  }

  async removeCourse(studentId: string, courseId: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ["courses"],
    });
    if (!student) throw new HttpException("Student not found", HttpStatus.NOT_FOUND);
    student.courses = (student.courses ?? []).filter((c) => c.id !== courseId);
    return this.studentRepository.save(student);
  }

  async countStudents(): Promise<number> {
    return this.studentRepository.count();
  }
}
