import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Course } from '../../course/entities/course.entity';

@Entity('directions')
export class Direction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'odd' })
  dayType: string; // 'odd' | 'even' | 'daily'

  @Column({ nullable: true })
  startTime: string; // "09:00"

  @Column({ nullable: true })
  endTime: string; // "11:00"

  @OneToMany(() => Course, (course) => course.direction)
  courses: Course[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
