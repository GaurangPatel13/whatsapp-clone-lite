import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import type { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  // 7 days in seconds
  return jwt.sign(payload, JWT_SECRET, { expiresIn: 604800 });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<{ token: string; user: User } | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  const token = generateToken({ userId: user.id, email: user.email });

  return { token, user };
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token);
  if (!payload) return null;

  return prisma.user.findUnique({ where: { id: payload.userId } });
}

export async function createUser(email: string, password: string, displayName: string): Promise<{ token: string; user: User }> {
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      displayName,
    },
  });

  // Create presence record
  await prisma.presence.create({
    data: {
      userId: user.id,
      status: 'ONLINE',
    },
  });

  const token = generateToken({ userId: user.id, email: user.email });

  return { token, user };
}
