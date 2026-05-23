import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  firstName: string;

  @Column({ length: 255, nullable: true })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: false })
  isVerify: boolean;

  @Column({ type: 'varchar', nullable: true })
  verifyCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verifyCodeExpiresAt: Date | null;

  @Exclude()
  @Column({ nullable: true, type: 'text' })
  accessToken: string | null;

  @Exclude()
  @Column({ nullable: true, type: 'text' })
  refreshToken: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastLogin: Date;

  @Column({ default: false })
  isLogOut: boolean;

  @Column({
    type: 'enum',
    enum: ['user', 'admin', 'teacher', 'moderator', 'superadmin', 'student'],
    default: 'user',
  })
  role: string;

  @Column({ nullable: true, default: '' })
  avatarUrl: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  googleId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
