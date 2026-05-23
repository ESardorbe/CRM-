import {
  Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn,
  Column, CreateDateColumn, Index, Unique,
} from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import { Course } from '../../course/entities/course.entity';

export type AttendanceStatus = 'present' | 'absent' | 'late';

@Entity('attendance')
@Unique(['student', 'course', 'date'])
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'CASCADE', eager: false })
  @JoinColumn()
  student: Student;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'CASCADE', eager: false })
  @JoinColumn()
  course: Course;

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', default: 'present' })
  status: AttendanceStatus;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;
}
