import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler.middleware';

jest.mock('../config/database', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../services/tokenBlacklist.service', () => ({
  TokenBlacklistService: {
    isBlacklisted: jest.fn().mockResolvedValue(false),
    blacklist: jest.fn().mockResolvedValue(undefined),
  },
}));

import { prisma } from '../config/database';

const mockUser = {
  id: 'uuid-1234',
  email: 'test@rentas.com',
  passwordHash: '$2b$12$placeholder',
  firstName: 'Test',
  lastName: 'User',
  role: 'renter',
  avatarUrl: null,
  isActive: true,
};

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('normalizeEmail', () => {
    it('lowercases and trims', () => {
      expect(AuthService.normalizeEmail('  USER@Example.COM  ')).toBe('user@example.com');
    });
  });

  describe('login', () => {
    it('throws 401 when user not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.login('notfound@rentas.com', 'pass')).rejects.toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
      });
    });

    it('throws 401 when user is inactive', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ ...mockUser, isActive: false });

      await expect(AuthService.login('test@rentas.com', 'pass')).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  describe('register', () => {
    it('throws 409 when email already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        AuthService.register({
          email: 'test@rentas.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toMatchObject({ statusCode: 409, code: 'CONFLICT' });
    });

    it('creates user and returns tokens when email is new', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new-uuid',
        email: 'new@rentas.com',
        firstName: 'New',
        lastName: 'User',
        role: 'renter',
        createdAt: new Date(),
      });

      const result = await AuthService.register({
        email: 'new@rentas.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('new@rentas.com');
    });
  });

  describe('getMe', () => {
    it('throws 404 when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.getMe('non-existent-id')).rejects.toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('AppError', () => {
    it('is an instance of Error', () => {
      const err = new AppError(400, 'BAD_REQUEST', 'test');
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('BAD_REQUEST');
    });
  });
});
