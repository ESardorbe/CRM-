import { UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "./jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY || "defaultSecretKey",
    });
  }

  async validate(payload: JwtPayload) {
    const { sub } = payload;
    const user = await this.userRepository.findOne({ where: { id: sub } });

    if (!user || user.isLogOut) {
      throw new UnauthorizedException("Please log in to access this resource");
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      isVerify: payload.isVerify,
    };
  }
}
