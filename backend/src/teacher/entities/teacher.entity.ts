import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Course } from '../../course/entities/course.entity';
import { Direction } from '../../direction/entities/direction.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  teacherId: string;

  @Column({ type: 'timestamp', nullable: true })
  hireDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Direction, { nullable: true, eager: false, onDelete: 'SET NULL' })
  @JoinColumn()
  direction: Direction;

  @OneToMany(() => Course, course => course.teacher)
  courses: Course[];

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalInfo: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
