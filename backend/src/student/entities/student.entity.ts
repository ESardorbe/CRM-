import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  studentId: string;

  @Column({ type: 'timestamp', nullable: true })
  enrollmentDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Course, course => course.students)
  courses: Course[];

  @Column({ nullable: true })
  parentName: string;

  @Column({ nullable: true })
  parentPhone: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true })
  major: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
