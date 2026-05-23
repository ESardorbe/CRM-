import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
import { Payment, PaymentStatus } from "./entities/payment.entity";
import { StudentMovement, MovementType } from "./entities/student-movement.entity";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { CreateStudentMovementDto } from "./dto/create-student-movement.dto";
import { StatisticsQueryDto } from "./dto/statistics-query.dto";
import { MonthlyReportDto } from "./dto/monthly-report.dto";
import { StudentService } from "../student/student.service";
import { CourseService } from "../course/course.service";

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(StudentMovement)
    private studentMovementRepository: Repository<StudentMovement>,
    private studentService: StudentService,
    private courseService: CourseService
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { studentId, courseId, ...paymentData } = createPaymentDto;
    await this.studentService.findOne(studentId);
    await this.courseService.findOne(courseId);

    const newPayment = this.paymentRepository.create({
      student: { id: studentId } as any,
      course: { id: courseId } as any,
      ...paymentData,
    });

    return this.paymentRepository.save(newPayment);
  }

  async findAllPayments(query: StatisticsQueryDto) {
    const {
      startDate,
      endDate,
      courseId,
      paymentStatus,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (startDate && endDate) {
      where.paymentDate = Between(startDate, endDate);
    } else if (startDate) {
      where.paymentDate = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.paymentDate = LessThanOrEqual(endDate);
    }
    if (courseId) where.course = { id: courseId };
    if (paymentStatus) where.status = paymentStatus;

    const [data, total] = await this.paymentRepository.findAndCount({
      where,
      relations: ["student", "student.user", "course"],
      order: { paymentDate: "DESC" },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ["student", "student.user", "course"],
    });

    if (!payment) {
      throw new HttpException("Payment not found", HttpStatus.NOT_FOUND);
    }

    return payment;
  }

  async updatePayment(
    id: string,
    updatePaymentDto: UpdatePaymentDto
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new HttpException("Payment not found", HttpStatus.NOT_FOUND);
    }

    Object.assign(payment, updatePaymentDto);
    await this.paymentRepository.save(payment);

    return this.paymentRepository.findOne({
      where: { id },
      relations: ["student", "student.user", "course"],
    }) as Promise<Payment>;
  }

  async removePayment(id: string): Promise<{ message: string }> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new HttpException("Payment not found", HttpStatus.NOT_FOUND);
    }
    await this.paymentRepository.delete(id);
    return { message: "Payment deleted successfully" };
  }

  async createStudentMovement(
    createStudentMovementDto: CreateStudentMovementDto
  ) {
    const { studentId, courseId, ...movementData } = createStudentMovementDto;
    await this.studentService.findOne(studentId);
    await this.courseService.findOne(courseId);

    const newMovement = this.studentMovementRepository.create({
      student: { id: studentId } as any,
      course: { id: courseId } as any,
      date: movementData.date || new Date(),
      ...movementData,
    });

    if (movementData.type === MovementType.JOINED) {
      try {
        await this.courseService.addStudent(courseId, studentId);
      } catch (error) {
        if (error.status !== HttpStatus.BAD_REQUEST) throw error;
      }
    }

    if (movementData.type === MovementType.LEFT) {
      try {
        await this.courseService.removeStudent(courseId, studentId);
      } catch (error) {
        if (error.status !== HttpStatus.BAD_REQUEST) throw error;
      }
    }

    return this.studentMovementRepository.save(newMovement);
  }

  async findAllStudentMovements(query: StatisticsQueryDto) {
    const {
      startDate,
      endDate,
      courseId,
      movementType,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.date = LessThanOrEqual(endDate);
    }
    if (courseId) where.course = { id: courseId };
    if (movementType) where.type = movementType;

    const [data, total] = await this.studentMovementRepository.findAndCount({
      where,
      relations: ["student", "student.user", "course"],
      order: { date: "DESC" },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  getDashboardStatistics() {
    return { message: "Dashboard statistics data" };
  }

  async getMonthlyReport(reportDto: MonthlyReportDto): Promise<any> {
    const { year, month, courseId } = reportDto;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const movementWhere: any = { date: Between(startDate, endDate) };
    const paymentWhere: any = { paymentDate: Between(startDate, endDate) };

    if (courseId) {
      movementWhere.course = { id: courseId };
      paymentWhere.course = { id: courseId };
    }

    const [joinedStudents, leftStudents, payments] = await Promise.all([
      this.studentMovementRepository.find({
        where: { ...movementWhere, type: MovementType.JOINED },
        relations: ["student", "student.user", "course"],
      }),
      this.studentMovementRepository.find({
        where: { ...movementWhere, type: MovementType.LEFT },
        relations: ["student", "student.user", "course"],
      }),
      this.paymentRepository.find({
        where: paymentWhere,
        relations: ["student", "student.user", "course"],
      }),
    ]);

    const totalPayments = payments.length;
    const completedPayments = payments.filter(
      (p) => p.status === PaymentStatus.COMPLETED
    ).length;
    const pendingPayments = payments.filter(
      (p) => p.status === PaymentStatus.PENDING
    ).length;
    const totalRevenue = payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const paymentsByCourse: Record<string, any> = {};
    payments.forEach((payment) => {
      const cId = payment.course.id;
      const title = payment.course.title;
      if (!paymentsByCourse[cId]) {
        paymentsByCourse[cId] = {
          courseId: cId,
          title,
          totalAmount: 0,
          count: 0,
          completed: 0,
          pending: 0,
        };
      }
      paymentsByCourse[cId].count++;
      if (payment.status === PaymentStatus.COMPLETED) {
        paymentsByCourse[cId].completed++;
        paymentsByCourse[cId].totalAmount += Number(payment.amount);
      } else if (payment.status === PaymentStatus.PENDING) {
        paymentsByCourse[cId].pending++;
      }
    });

    const movementsByCourse: Record<string, any> = {};
    joinedStudents.forEach((m) => {
      const cId = m.course.id;
      const title = m.course.title;
      if (!movementsByCourse[cId]) {
        movementsByCourse[cId] = { courseId: cId, title, joined: 0, left: 0, netChange: 0 };
      }
      movementsByCourse[cId].joined++;
      movementsByCourse[cId].netChange++;
    });
    leftStudents.forEach((m) => {
      const cId = m.course.id;
      const title = m.course.title;
      if (!movementsByCourse[cId]) {
        movementsByCourse[cId] = { courseId: cId, title, joined: 0, left: 0, netChange: 0 };
      }
      movementsByCourse[cId].left++;
      movementsByCourse[cId].netChange--;
    });

    return {
      period: { year, month, startDate, endDate },
      studentMovements: {
        total: joinedStudents.length + leftStudents.length,
        joined: joinedStudents.length,
        left: leftStudents.length,
        netChange: joinedStudents.length - leftStudents.length,
        byCourse: Object.values(movementsByCourse),
        joinedStudents: joinedStudents.map((m) => ({
          id: m.id,
          date: m.date,
          studentId: m.student.studentId,
          studentName: `${m.student.user.firstName} ${m.student.user.lastName}`,
          email: m.student.user.email,
          courseId: m.course.id,
          courseTitle: m.course.title,
          courseCode: m.course.code,
          reason: m.reason || null,
        })),
        leftStudents: leftStudents.map((m) => ({
          id: m.id,
          date: m.date,
          studentId: m.student.studentId,
          studentName: `${m.student.user.firstName} ${m.student.user.lastName}`,
          email: m.student.user.email,
          courseTitle: m.course.title,
          courseCode: m.course.code,
          reason: m.reason || null,
        })),
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        pending: pendingPayments,
        revenue: totalRevenue,
        byCourse: Object.values(paymentsByCourse),
      },
    };
  }
}
