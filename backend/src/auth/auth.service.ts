import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Teacher } from "../teacher/entities/teacher.entity";
import { Student } from "../student/entities/student.entity";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { MailService } from "./mail.service";
import { JwtPayload } from "./jwt-payload.interface";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { RegisterWithRoleDto } from "./dto/register-with-role.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { firstName, lastName, email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new HttpException(
        "Foydalanuvchi allaqachon ro'yxatdan o'tgan!",
        HttpStatus.BAD_REQUEST
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = crypto.randomBytes(3).toString("hex");

    const newUser = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await this.userRepository.save(newUser);
    await this.mailService.sendVerificationCode(email, verifyCode);

    return { message: "Foydalanuvchi yaratildi, emailni tekshiring!" };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException("Noto'g'ri parol!", HttpStatus.BAD_REQUEST);
    }

    if (!user.isVerify) {
      throw new HttpException("Email tasdiqlanmagan!", HttpStatus.BAD_REQUEST);
    }

    const tokens = this.generateTokens(user);
    user.lastLogin = new Date();
    user.isLogOut = false;
    await this.userRepository.save(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      message: "Muvaffaqiyatli tizimga kirildi",
    };
  }

  async verifyEmailCode(email: string, code: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }

    if (user.verifyCode !== code) {
      throw new HttpException(
        "Noto'g'ri tasdiqlash kodi!",
        HttpStatus.BAD_REQUEST
      );
    }

    if (user.verifyCodeExpiresAt && new Date() > user.verifyCodeExpiresAt) {
      throw new HttpException(
        "Tasdiqlash kodi muddati o'tdi!",
        HttpStatus.BAD_REQUEST
      );
    }

    user.isVerify = true;
    user.verifyCode = null;
    user.verifyCodeExpiresAt = null;
    await this.userRepository.save(user);

    return { message: "Email muvaffaqiyatli tasdiqlandi!" };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    const { email } = resetPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }

    const resetCode = crypto.randomBytes(3).toString("hex");
    user.verifyCode = resetCode;
    user.verifyCodeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.userRepository.save(user);
    await this.mailService.sendResetPasswordCode(email, resetCode);

    return { message: "Parolni tiklash kodi yuborildi!" };
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto): Promise<any> {
    const { email, verifyCode, newPassword } = updatePasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }

    if (user.verifyCode !== verifyCode) {
      throw new HttpException("Noto'g'ri reset kodi!", HttpStatus.BAD_REQUEST);
    }

    if (user.verifyCodeExpiresAt && new Date() > user.verifyCodeExpiresAt) {
      throw new HttpException("Kod muddati o'tdi!", HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.verifyCode = null;
    user.verifyCodeExpiresAt = null;
    await this.userRepository.save(user);

    return { message: "Parol muvaffaqiyatli yangilandi!" };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }

    if (user.isLogOut) {
      throw new HttpException(
        "Foydalanuvchi allaqachon log out qilingan!",
        HttpStatus.BAD_REQUEST
      );
    }

    user.refreshToken = null;
    user.isLogOut = true;
    await this.userRepository.save(user);
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async getAllUsers(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const qb = this.userRepository.createQueryBuilder('user');
    if (search) {
      qb.where(
        'user.firstName ILIKE :s OR user.lastName ILIKE :s OR user.email ILIKE :s',
        { s: `%${search}%` },
      );
    }
    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('Foydalanuvchi topilmadi!', HttpStatus.NOT_FOUND);
    }
    if (user.role === 'superadmin') {
      throw new HttpException(
        'SuperAdminni o\'chirib bo\'lmaydi!',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.userRepository.delete(userId);
    return { message: 'Foydalanuvchi o\'chirildi' };
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }

    if (updateProfileDto.firstName) user.firstName = updateProfileDto.firstName;
    if (updateProfileDto.lastName) user.lastName = updateProfileDto.lastName;
    if (updateProfileDto.avatarUrl) user.avatarUrl = updateProfileDto.avatarUrl;
    if (updateProfileDto.phone) user.phone = updateProfileDto.phone;

    return this.userRepository.save(user);
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException("Foydalanuvchi topilmadi!", HttpStatus.NOT_FOUND);
    }
    const prevRole = user.role;
    user.role = role;
    await this.userRepository.save(user);

    if (role === 'teacher' && prevRole !== 'teacher') {
      const existing = await this.teacherRepository.findOne({ where: { user: { id: userId } } });
      if (!existing) {
        const teacher = this.teacherRepository.create({
          user,
          teacherId: `TCH${Date.now()}`,
          hireDate: new Date(),
        });
        await this.teacherRepository.save(teacher);
      }
    }

    if (role === 'student' && prevRole !== 'student') {
      const existing = await this.studentRepository.findOne({ where: { user: { id: userId } } });
      if (!existing) {
        const student = this.studentRepository.create({
          user,
          studentId: `ST${Date.now()}`,
          enrollmentDate: new Date(),
        });
        await this.studentRepository.save(student);
      }
    }

    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return this.userRepository.find({ where: { role } });
  }

  async registerWithRole(
    registerWithRoleDto: RegisterWithRoleDto
  ): Promise<any> {
    const { firstName, lastName, email, password, role } = registerWithRoleDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new HttpException(
        "Foydalanuvchi allaqachon ro'yxatdan o'tgan!",
        HttpStatus.BAD_REQUEST
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      firstName,
      lastName: lastName ?? '',
      email,
      password: hashedPassword,
      role: role || 'user',
      isVerify: true,
    });

    await this.userRepository.save(newUser);

    return { message: "Foydalanuvchi muvaffaqiyatli yaratildi!" };
  }

  async findOrCreateGoogleUser(data: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }): Promise<User> {
    let user = await this.userRepository.findOne({
      where: [{ googleId: data.googleId }, { email: data.email }],
    });

    if (!user) {
      const randomPass = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      user = this.userRepository.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        avatarUrl: data.avatarUrl,
        googleId: data.googleId,
        password: randomPass,
        role: 'user',
        isVerify: true,
      });
      await this.userRepository.save(user);
    } else if (!user.googleId) {
      user.googleId = data.googleId;
      user.isVerify = true;
      await this.userRepository.save(user);
    }

    return user;
  }

  async handleGoogleCallback(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = this.generateTokens(user);
    user.isLogOut = false;
    user.lastLogin = new Date();
    await this.userRepository.save(user);
    return tokens;
  }

  generateTokens(user: User) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      isVerify: user.isVerify,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: "1h" });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;

    return { accessToken, refreshToken };
  }
}
