import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    const email = this.configService.get<string>('SUPERADMIN_EMAIL', 'superadmin@crm.uz');
    const password = this.configService.get<string>('SUPERADMIN_PASSWORD', 'SuperAdmin123!');

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) return;

    const hashed = await bcrypt.hash(password, 10);
    const superAdmin = this.userRepository.create({
      firstName: 'Super',
      lastName: 'Admin',
      email,
      password: hashed,
      role: 'superadmin',
      isVerify: true,
    });

    await this.userRepository.save(superAdmin);
    this.logger.log(`SuperAdmin yaratildi: ${email}`);
  }
}
