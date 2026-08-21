import { Router } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../lib/prisma.js';
import {
  checkPassword,
  coupleAuth,
  generateCoupleToken,
  isConfigured,
} from '../middleware/couple.js';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Nothing here should ever be indexed or cached by anything in between
router.use((_req, res, next) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.set('Cache-Control', 'no-store');
  next();
});

// ---- unlock -------------------------------------------------------------

// A few wrong guesses are fine; a hundred are not.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function tooManyAttempts(ip: string): boolean {
  const record = attempts.get(ip);
  if (!record) return false;
  if (Date.now() - record.first > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string) {
  const record = attempts.get(ip);
  if (!record || Date.now() - record.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: Date.now() });
  } else {
    record.count += 1;
  }
}

router.post('/unlock', async (req, res) => {
  const ip = req.ip || 'unknown';

  if (!isConfigured()) {
    return res.status(503).json({ error: 'not-configured' });
  }

  if (tooManyAttempts(ip)) {
    return res.status(429).json({ error: 'Too many tries. Wait a few minutes.' });
  }

  // Slow every attempt down a little, right or wrong
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (!checkPassword(req.body?.password)) {
    recordAttempt(ip);
    return res.status(401).json({ error: 'that is not it' });
  }

  attempts.delete(ip);
  res.json({ token: generateCoupleToken() });
});

// Is the token still good?
router.get('/session', coupleAuth, (_req, res) => {
  res.json({ ok: true });
});

// ---- notes --------------------------------------------------------------

// A short two-line label for the wheel: the first couple of words that carry
// any meaning. Editable per note afterwards.
const FILLER = new Set(['i', 'we', 'you', 'the', 'a', 'an', 'my', 'our', 'that', 'it', 'to']);

function deriveSpinLabel(body: string): string {
  const words = body
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}'-]/gu, ''))
    .filter(Boolean);

  let start = 0;
  while (start < words.length - 1 && FILLER.has(words[start].toLowerCase())) start += 1;

  const picked = words.slice(start, start + 2);
  return picked.join('\n').slice(0, 28);
}

router.get('/notes', coupleAuth, async (_req, res) => {
  try {
    const notes = await prisma.note.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(notes);
  } catch (error) {
    console.error('Notes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.post('/notes', coupleAuth, async (req, res) => {
  try {
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
    const photoUrl = typeof req.body?.photoUrl === 'string' ? req.body.photoUrl : null;
    const spinLabel =
      typeof req.body?.spinLabel === 'string' && req.body.spinLabel.trim()
        ? req.body.spinLabel.trim().slice(0, 28)
        : deriveSpinLabel(body);

    if (!body) return res.status(400).json({ error: 'Write something first' });
    if (body.length > 2000) return res.status(400).json({ error: 'That is a long one — trim it a bit' });

    const note = await prisma.note.create({
      data: { body, photoUrl, spinLabel },
    });
    res.json(note);
  } catch (error) {
    console.error('Note create error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

router.patch('/notes/:id', coupleAuth, async (req, res) => {
  try {
    const data: Record<string, unknown> = {};

    if (typeof req.body?.done === 'boolean') {
      data.done = req.body.done;
      data.doneAt = req.body.done ? new Date() : null;
    }
    if (typeof req.body?.body === 'string' && req.body.body.trim()) {
      data.body = req.body.body.trim().slice(0, 2000);
    }
    if (typeof req.body?.spinLabel === 'string') {
      data.spinLabel = req.body.spinLabel.trim().slice(0, 28) || null;
    }
    if (req.body?.photoUrl === null || typeof req.body?.photoUrl === 'string') {
      data.photoUrl = req.body.photoUrl;
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({ error: 'Nothing to change' });
    }

    const note = await prisma.note.update({ where: { id: req.params.id }, data });
    res.json(note);
  } catch (error) {
    console.error('Note update error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/notes/:id', coupleAuth, async (req, res) => {
  try {
    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Note delete error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ---- settings (names, anniversary, next date) ---------------------------

const DEFAULTS = { nameOne: 'karar', nameTwo: 'dania' };

function parseName(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().slice(0, 24);
  return trimmed || fallback;
}

router.get('/settings', coupleAuth, async (_req, res) => {
  try {
    const settings = await prisma.coupleSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      return res.json({ id: 'main', ...DEFAULTS, anniversary: null, nextDate: null });
    }
    // A row saved before the names existed still answers with something
    res.json({
      ...settings,
      nameOne: settings.nameOne || DEFAULTS.nameOne,
      nameTwo: settings.nameTwo || DEFAULTS.nameTwo,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', coupleAuth, async (req, res) => {
  try {
    const anniversary = req.body?.anniversary ? new Date(req.body.anniversary) : null;
    if (anniversary && Number.isNaN(anniversary.getTime())) {
      return res.status(400).json({ error: 'That date does not look right' });
    }
    const nextDate =
      typeof req.body?.nextDate === 'string' ? req.body.nextDate.trim().slice(0, 60) || null : null;

    const nameOne = parseName(req.body?.nameOne, DEFAULTS.nameOne);
    const nameTwo = parseName(req.body?.nameTwo, DEFAULTS.nameTwo);

    const data = { nameOne, nameTwo, anniversary, nextDate };
    const settings = await prisma.coupleSettings.upsert({
      where: { id: 'main' },
      update: data,
      create: { id: 'main', ...data },
    });
    res.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ---- photos -------------------------------------------------------------

const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.post('/photo', coupleAuth, photoUpload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo provided' });
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ error: 'Photo storage not configured' });
    }

    // Random public id so the URL cannot be guessed from the folder listing
    const publicId = crypto.randomBytes(16).toString('hex');

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'karar-portfolio/us',
          public_id: publicId,
          transformation: [
            { width: 1400, height: 1400, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded))
      );
      uploadStream.end(req.file!.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (error: any) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

export default router;
