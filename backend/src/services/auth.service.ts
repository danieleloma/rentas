import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config';
import { JwtPayload, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler.middleware';
import { TokenBlacklistService } from './tokenBlacklist.service';

export class AuthService {
  /** Single canonical form for emails (avoids duplicate accounts differing only by case). */
  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
  }) {
    const email = AuthService.normalizeEmail(data.email);
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (existing) {
      throw new AppError(409, 'CONFLICT', 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || 'renter',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = AuthService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    return { user, ...tokens };
  }

  static async login(email: string, password: string) {
    const normalized = AuthService.normalizeEmail(email);
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalized, mode: 'insensitive' } },
    });
    if (!user || !user.isActive) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
    }

    const canonicalEmail = user.email !== normalized ? normalized : user.email;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        ...(user.email !== normalized ? { email: normalized } : {}),
      },
    });

    const tokens = AuthService.generateTokens({
      userId: user.id,
      email: canonicalEmail,
      role: user.role as UserRole,
    });

    return {
      user: {
        id: user.id,
        email: canonicalEmail,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  static async refreshToken(refreshToken: string) {
    let decoded: JwtPayload & { exp?: number };

    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload & { exp?: number };
    } catch {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid refresh token');
    }

    if (await TokenBlacklistService.isBlacklisted(refreshToken)) {
      throw new AppError(401, 'UNAUTHORIZED', 'Refresh token has been revoked');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not found or inactive');
    }

    // Rotate: blacklist old refresh token for its remaining TTL
    const remainingTtl = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 604800;
    await TokenBlacklistService.blacklist(refreshToken, remainingTtl);

    return AuthService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });
  }

  static async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = jwt.decode(refreshToken) as (JwtPayload & { exp?: number }) | null;
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        await TokenBlacklistService.blacklist(refreshToken, ttl);
      }
    } catch {
      // Best-effort — don't block logout on Redis failures
    }
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    return user;
  }

  private static generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }
}
