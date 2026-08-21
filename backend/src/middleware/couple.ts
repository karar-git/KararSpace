import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const SCOPE = 'us';

export interface CoupleRequest extends Request {
  couple?: true;
}

/**
 * The shared password lives in the COUPLE_PASSWORD env var (Railway).
 * It is never committed — this repo is public.
 */
export function isConfigured(): boolean {
  return Boolean(process.env.COUPLE_PASSWORD);
}

// Forgiving about capitals, spacing and trailing punctuation, so a phrase typed
// with or without a question mark counts as the same password.
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[?!.]+$/, '');
}

export function checkPassword(attempt: unknown): boolean {
  const expected = process.env.COUPLE_PASSWORD;
  if (!expected || typeof attempt !== 'string') return false;

  const a = Buffer.from(normalize(attempt));
  const b = Buffer.from(normalize(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function generateCoupleToken(): string {
  return jwt.sign({ scope: SCOPE }, JWT_SECRET, { expiresIn: '60d' });
}

export function coupleAuth(req: CoupleRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.us_token;

  if (!token) {
    return res.status(401).json({ error: 'Locked' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { scope?: string };
    if (decoded.scope !== SCOPE) {
      return res.status(401).json({ error: 'Locked' });
    }
    req.couple = true;
    next();
  } catch {
    return res.status(401).json({ error: 'Locked' });
  }
}
