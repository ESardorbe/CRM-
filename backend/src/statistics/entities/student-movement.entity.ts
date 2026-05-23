import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import { Course } from '../../course/entities/course.entity';

export enum MovementType {
  JOINED = 'joined',
  LEFT = 'left',
}

@Entity('student_movements')
export class StudentMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  student: Student;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  course: Course;

  @Column({ type: 'enum', enum: MovementType })
  type: MovementType;

  @Index()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
