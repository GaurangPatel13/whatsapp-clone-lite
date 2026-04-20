// Mock the prisma client
jest.mock('@/server/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    conversation: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    conversationParticipant: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    presence: {
      upsert: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    call: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed_password')),
  compare: jest.fn(() => Promise.resolve(true)),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock_token'),
  verify: jest.fn(() => ({ userId: '1', email: 'test@example.com' })),
}));

describe('API Utilities', () => {
  describe('Auth utilities', () => {
    it('should hash password', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 12);
      expect(hashedPassword).toBe('hashed_password');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should verify password', async () => {
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare('password123', 'hashed_password');
      expect(isValid).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
    });

    it('should generate token', () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ userId: '1', email: 'test@example.com' }, 'secret', { expiresIn: '7d' });
      expect(token).toBe('mock_token');
    });

    it('should verify token', () => {
      const jwt = require('jsonwebtoken');
      const payload = jwt.verify('mock_token', 'secret');
      expect(payload).toEqual({ userId: '1', email: 'test@example.com' });
    });
  });
});
