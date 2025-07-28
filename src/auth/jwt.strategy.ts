import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'Herlwskerjlsd9oklEW-3439',
    });
  }

  async validate(payload: any) {
    const userId = payload.sub || payload.id;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return {
      id: userId,
      email: payload.email || null,
      role: payload.role || null,
    };
  }
}
