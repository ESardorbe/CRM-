import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column()
  fileUrl: string;

  @Column()
  fileName: string;

  @Column()
  fileType: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn()
  course: Course;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  uploadedBy: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
