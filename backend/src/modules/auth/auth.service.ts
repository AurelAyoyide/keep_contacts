import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) { }

  // ─── Register ──────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new BadRequestException('Email déjà utilisé');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        verificationToken,
        isVerified: false,
      },
    });

    // Send verification email (non-blocking)
    this.mailService
      .sendVerificationEmail(user.email, verificationToken)
      .catch((err) =>
        this.logger.error('Failed to send verification email', err),
      );

    return {
      message:
        'Inscription réussie ! Un email de vérification a été envoyé à votre adresse.',
    };
  }

  // ─── Verify Email ──────────────────────────────────────────
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token de vérification invalide');
    }

    if (user.isVerified) {
      return { message: 'Email déjà vérifié' };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return { message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' };
  }

  // ─── Login ─────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!user.isVerified) {
      throw new ForbiddenException(
        'Veuillez vérifier votre email avant de vous connecter',
      );
    }

    // Update lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { accessToken, refreshToken } =
      await this.generateTokenPair(user.id);

    return { accessToken, refreshToken };
  }

  // ─── Forgot Password ──────────────────────────────────────
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to avoid email enumeration
    if (!user) {
      return {
        message:
          'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
      };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    this.mailService
      .sendPasswordResetEmail(user.email, resetToken)
      .catch((err) =>
        this.logger.error('Failed to send password reset email', err),
      );

    return {
      message:
        'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    };
  }

  // ─── Reset Password ───────────────────────────────────────
  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { resetPasswordToken: token },
    });

    if (!user || !user.resetPasswordExpires) {
      throw new BadRequestException('Token de réinitialisation invalide');
    }

    if (user.resetPasswordExpires < new Date()) {
      throw new BadRequestException(
        'Le token de réinitialisation a expiré',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Invalidate all existing refresh tokens
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  // ─── Refresh Tokens ───────────────────────────────────────
  async refreshTokens(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token expiré');
    }

    // Rotate: delete old token, create new pair
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const tokenPair = await this.generateTokenPair(storedToken.userId);

    return tokenPair;
  }

  // ─── Logout ────────────────────────────────────────────────
  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { message: 'Déconnexion réussie' };
  }

  // ─── Get Me ────────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        organizations: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      organizations: user.organizations.map((uo) => ({
        id: uo.organization.id,
        name: uo.organization.name,
        role: uo.role,
      })),
    };
  }

  // ─── Resend Verification Email ─────────────────────────────
  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return {
        message: 'Si un compte existe avec cet email, un email de vérification a été envoyé.',
      };
    }

    if (user.isVerified) {
      return { message: 'Cet email est déjà vérifié' };
    }

    const verificationToken = uuidv4();

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    this.mailService
      .sendVerificationEmail(user.email, verificationToken)
      .catch((err) =>
        this.logger.error('Failed to send verification email', err),
      );

    return {
      message: 'Si un compte existe avec cet email, un email de vérification a été envoyé.',
    };
  }

  // ─── Private Helpers ───────────────────────────────────────
  private async generateTokenPair(userId: string) {
    const accessToken = this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      },
    );

    const refreshTokenValue = uuidv4();
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    // Parse duration to ms
    const ms = this.parseDuration(refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        expiresAt: new Date(Date.now() + ms),
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
