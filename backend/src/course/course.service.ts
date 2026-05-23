import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Course } from "./entities/course.entity";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { TeacherService } from "../teacher/teacher.service";
import { StudentService } from "../student/student.service";

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private teacherService: TeacherService,
    private studentService: StudentService
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const { teacherId, directionId, ...courseData } = createCourseDto as CreateCourseDto & { directionId?: string };

    const newCourse = this.courseRepository.create({
      ...courseData,
      students: [],
    });

    if (teacherId) {
      await this.teacherService.findOne(teacherId);
      newCourse.teacher = { id: teacherId } as any;
    }

    if (directionId) {
      newCourse.direction = { id: directionId } as any;
    }

    return this.courseRepository.save(newCourse);
  }

  async findAll(page = 1, limit = 10, isActive?: boolean): Promise<{ data: Course[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await this.courseRepository.findAndCount({
      where,
      relations: ["teacher", "teacher.user", "students", "students.user", "direction"],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ["teacher", "teacher.user", "students", "students.user", "direction"],
    });

    if (!course) {
      throw new HttpException("Course not found", HttpStatus.NOT_FOUND);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const { teacherId, directionId, ...courseData } = updateCourseDto;

    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ["teacher"],
    });
    if (!course) {
      throw new HttpException("Course not found", HttpStatus.NOT_FOUND);
    }

    if (teacherId !== undefined) {
      if (teacherId) {
        await this.teacherService.findOne(teacherId);
        course.teacher = { id: teacherId } as any;
      } else {
        course.teacher = null;
      }
    }

    if (directionId !== undefined) {
      course.direction = directionId ? ({ id: directionId } as any) : null;
    }

    Object.assign(course, courseData);
    return this.courseRepository.save(course);
  }

  async remove(id: string): Promise<{ message: string }> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ["students"],
    });
    if (!course) {
      throw new HttpException("Course not found", HttpStatus.NOT_FOUND);
    }

    course.students = [];
    await this.courseRepository.save(course);
    await this.courseRepository.delete(id);

    return { message: "Course deleted successfully" };
  }

  async addStudent(courseId: string, studentId: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ["students"],
    });
    if (!course) {
      throw new HttpException("Course not found", HttpStatus.NOT_FOUND);
    }

    await this.studentService.findOne(studentId);

    if (
      course.students &&
      course.students.some((student) => student.id === studentId)
    ) {
      throw new HttpException(
        "Student is already enrolled in this course",
        HttpStatus.BAD_REQUEST
      );
    }

    if (
      course.capacity &&
      course.students &&
      course.students.length >= course.capacity
    ) {
      throw new HttpException(
        "Course is at full capacity",
        HttpStatus.BAD_REQUEST
      );
    }

    if (!course.students) course.students = [];
    course.students.push({ id: studentId } as any);

    await this.studentService.addCourse(studentId, courseId);

    return this.courseRepository.save(course);
  }

  async removeStudent(courseId: string, studentId: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ["students"],
    });
    if (!course) {
      throw new HttpException("Course not found", HttpStatus.NOT_FOUND);
    }

    if (
      !course.students ||
      !course.students.some((student) => student.id === studentId)
    ) {
      throw new HttpException(
        "Student is not enrolled in this course",
        HttpStatus.BAD_REQUEST
      );
    }

    course.students = course.students.filter(
      (student) => student.id !== studentId
    );

    await this.studentService.removeCourse(studentId, courseId);

    return this.courseRepository.save(course);
  }

  async getTeacherCourses(teacherId: string): Promise<Course[]> {
    return this.courseRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ["teacher", "teacher.user", "students", "students.user"],
    });
  }

  async getStudentCourses(studentId: string): Promise<Course[]> {
    return this.courseRepository
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.teacher", "teacher")
      .leftJoinAndSelect("teacher.user", "teacherUser")
      .leftJoinAndSelect("course.students", "student")
      .leftJoinAndSelect("student.user", "studentUser")
      .where("student.id = :studentId", { studentId })
      .getMany();
  }

  async countCourses(): Promise<number> {
    return this.courseRepository.count();
  }

  async countTeachers(): Promise<number> {
    const result = await this.courseRepository
      .createQueryBuilder("course")
      .select("COUNT(DISTINCT course.teacherId)", "count")
      .where("course.teacherId IS NOT NULL")
      .getRawOne();
    return parseInt(result.count, 10) || 0;
  }
}
