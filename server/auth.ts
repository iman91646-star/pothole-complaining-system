import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, User } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'potholetrack_secure_hmac_secret_2026_key';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  name: string;
  exp: number;
}

export function createToken(user: User): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp,
  };
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payloadEncoded}`)
    .digest('base64url');

  return `${header}.${payloadEncoded}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payloadEncoded, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payloadEncoded}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload: TokenPayload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString('utf-8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
    return;
  }

  const user = db.getUserById(payload.userId);
  if (!user) {
    res.status(401).json({ error: 'User account not found.' });
    return;
  }

  req.user = user;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        error: 'Access Denied\nAdministrator privileges required.',
        code: 'ADMIN_REQUIRED',
      });
      return;
    }
    next();
  });
}
