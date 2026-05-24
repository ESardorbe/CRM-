import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Course } from '../../course/entities/course.entity';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn()
  course: Course;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column()
  dayOfWeek: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ type: 'varchar', nullable: true })
  meetingLink: string | null;

  @Column({ type: 'varchar', nullable: true })
  room: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
