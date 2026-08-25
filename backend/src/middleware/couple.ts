import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const SCOPE = 'us';

export interface CoupleRequest extends Request {
  couple?: true;
}

/**
 * The shared password starts life in the COUPLE_PASSWORD env var (Railway) and
 * moves into the database the first time either of them changes it from the
 * page. Neither value is ever committed — this repo is public.
 */

interface PasswordState {
  hash: string | null;
  changedAt: Date | null;
}

// Every authorised request would otherwise read this row; once a minute is
// plenty. A change made here clears the cache immediately.
const CACHE_MS = 60 * 1000;
let cached: PasswordState | null = null;
let cachedAt = 0;

async function passwordState(): Promise<PasswordState> {
  if (cached && Date.now() - cachedAt < CACHE_MS) return cached;

  try {
    const row = await prisma.coupleSettings.findUnique({ where: { id: 'main' } });
    cached = { hash: row?.passwordHash ?? null, changedAt: row?.passwordChangedAt ?? null };
    cachedAt = Date.now();
  } catch (error) {
    // A database hiccup should not change who gets in — keep what we had
    console.error('Password state read failed:', error);
    if (!cached) cached = { hash: null, changedAt: null };
  }

  return cached;
}

export async function isConfigured(): Promise<boolean> {
  const { hash } = await passwordState();
  return Boolean(hash || process.env.COUPLE_PASSWORD);
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

export async function checkPassword(attempt: unknown): Promise<boolean> {
  if (typeof attempt !== 'string') return false;

  const { hash } = await passwordState();

  // Once one of them sets a password here, the env var stops counting
  if (hash) return bcrypt.compare(normalize(attempt), hash);

  const expected = process.env.COUPLE_PASSWORD;
  if (!expected) return false;

  const a = Buffer.from(normalize(attempt));
  const b = Buffer.from(normalize(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function setPassword(next: string): Promise<void> {
  const hash = await bcrypt.hash(normalize(next), 10);
  // Whole seconds, because that is the resolution a token's iat has
  const changedAt = new Date(Math.floor(Date.now() / 1000) * 1000);

  await prisma.coupleSettings.upsert({
    where: { id: 'main' },
    update: { passwordHash: hash, passwordChangedAt: changedAt },
    create: { id: 'main', passwordHash: hash, passwordChangedAt: changedAt },
  });

  cached = { hash, changedAt };
  cachedAt = Date.now();
}

export function generateCoupleToken(): string {
  return jwt.sign({ scope: SCOPE }, JWT_SECRET, { expiresIn: '60d' });
}

export async function coupleAuth(req: CoupleRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.us_token;

  if (!token) {
    return res.status(401).json({ error: 'Locked' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { scope?: string; iat?: number };
    if (decoded.scope !== SCOPE) {
      return res.status(401).json({ error: 'Locked' });
    }

    // Changing the password asks the other phone for the new one. Whoever made
    // the change is handed a fresh token, so they stay where they are.
    const { changedAt } = await passwordState();
    if (changedAt && (decoded.iat ?? 0) * 1000 < changedAt.getTime()) {
      return res.status(401).json({ error: 'Locked' });
    }

    req.couple = true;
    next();
  } catch {
    return res.status(401).json({ error: 'Locked' });
  }
}
