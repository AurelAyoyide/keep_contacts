import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email deja utilise');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash },
    });

    const token = this.generateToken(user.id);

    return { id: user.id, email: user.email, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const token = this.generateToken(user.id);

    return { token };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        organizations: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouve');
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      organizations: user.organizations.map((uo) => ({
        id: uo.organization.id,
        name: uo.organization.name,
        role: uo.role,
      })),
    };
  }

  private generateToken(userId: string): string {
    return this.jwtService.sign({ userId });
  }
}
