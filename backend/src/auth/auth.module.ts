import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Teacher } from "../teacher/entities/teacher.entity";
import { Student } from "../student/entities/student.entity";
import { JwtModule } from "@nestjs/jwt";
import { MailService } from "./mail.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AccessTokenGuard } from "./guards/access-token.guard";
import { JwtStrategy } from "./jwt.strategy";
import { AdminGuard } from "./guards/admin.guard";
import { RoleGuard } from "./guards/role.guard";
import { GoogleStrategy } from "./strategies/google.strategy";
import { SeedService } from "./seed.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User, Teacher, Student]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET_KEY"),
        signOptions: { expiresIn: "1h" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MailService,
    AccessTokenGuard,
    JwtStrategy,
    AdminGuard,
    RoleGuard,
    GoogleStrategy,
    SeedService,
  ],
  exports: [JwtStrategy, AccessTokenGuard, AdminGuard, RoleGuard, AuthService],
})
export class AuthModule {}
