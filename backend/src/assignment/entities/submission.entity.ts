import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Assignment } from './assignment.entity';
import { Student } from '../../student/entities/student.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Assignment, (a) => a.submissions, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn()
  assignment: Assignment;

  @ManyToOne(() => Student, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn()
  student: Student;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'varchar', nullable: true })
  fileUrl: string | null;

  @Column({ type: 'int', nullable: true })
  score: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @CreateDateColumn()
  submittedAt: Date;
}
