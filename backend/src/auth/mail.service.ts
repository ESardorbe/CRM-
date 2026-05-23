import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  // Tasdiqlash kodi yuborish
  async sendVerificationCode(email: string, verifyCode: string) {
    const message = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Email tasdiqlash kodi",
      text: `Sizning tasdiqlash kodingiz: ${verifyCode}`,
    };

    await this.transporter.sendMail(message);
  }

  // Parolni tiklash kodi yuborish
  async sendResetPasswordCode(email: string, resetCode: string) {
    const message = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Parolni tiklash kodi",
      text: `Sizning parolni tiklash kodingiz: ${resetCode}`,
    };

    await this.transporter.sendMail(message);
  }
}
