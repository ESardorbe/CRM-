import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(userId: string, title: string, body: string, type = 'info', link?: string): Promise<Notification> {
    const n = this.repo.create({
      title,
      body,
      type,
      link: link ?? null,
      isRead: false,
      user: { id: userId } as any,
    });
    return this.repo.save(n);
  }

  async findForUser(userId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.repo.update({ id, user: { id: userId } as any }, { isRead: true });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo.update({ user: { id: userId } as any, isRead: false }, { isRead: true });
  }

  async countUnread(userId: string): Promise<number> {
    return this.repo.count({ where: { user: { id: userId } as any, isRead: false } });
  }
}
