import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Teacher } from '../../teacher/entities/teacher.entity';
import { Student } from '../../student/entities/student.entity';
import { Direction } from '../../direction/entities/direction.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  code: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.courses, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  teacher: Teacher | null;

  @ManyToOne(() => Direction, (direction) => direction.courses, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  direction: Direction | null;

  @ManyToMany(() => Student, (student) => student.courses)
  @JoinTable({ name: 'course_students' })
  students: Student[];

  @Column({ type: 'date', nullable: true })
  startDate: string | null;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  credits: number;

  @Column('text', { array: true, nullable: true })
  schedule: string[];

  @Column({ nullable: true })
  capacity: number;

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
