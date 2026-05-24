import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.configService.get<string>("MAIL_USER"),
        pass: this.configService.get<string>("MAIL_PASS"),
      },
    });
  }

  async sendVerificationCode(email: string, verifyCode: string) {
    await this.transporter.sendMail({
      from: this.configService.get<string>("MAIL_FROM"),
      to: email,
      subject: "Email tasdiqlash kodi",
      text: `Sizning tasdiqlash kodingiz: ${verifyCode}`,
    });
  }

  async sendResetPasswordCode(email: string, resetCode: string) {
    await this.transporter.sendMail({
      from: this.configService.get<string>("MAIL_FROM"),
      to: email,
      subject: "Parolni tiklash kodi",
      text: `Sizning parolni tiklash kodingiz: ${resetCode}`,
    });
  }
}
