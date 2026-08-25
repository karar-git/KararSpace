import { Router } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import prisma from '../lib/prisma.js';
import {
  checkPassword,
  coupleAuth,
  generateCoupleToken,
  isConfigured,
} from '../middleware/couple.js';

const router = Router();

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

// ---- lists --------------------------------------------------------------

// The list every existing note belongs to, the first time this code runs
const FIRST_LIST_NAME = 'the date list';

// Notes written before lists existed have a null listId. The first list adopts
// them — once per boot, so the polling loop is not writing every few seconds.
let adopted = false;

async function ensureLists() {
  const lists = await prisma.noteList.findMany({ orderBy: { createdAt: 'asc' } });

  if (!lists.length) {
    const first = await prisma.noteList.create({ data: { name: FIRST_LIST_NAME } });
    await prisma.note.updateMany({ where: { listId: null }, data: { listId: first.id } });
    adopted = true;
    return [first];
  }

  if (!adopted) {
    await prisma.note.updateMany({ where: { listId: null }, data: { listId: lists[0].id } });
    adopted = true;
  }

  return lists;
}

function parseListName(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 40) : '';
}

router.get('/lists', coupleAuth, async (_req, res) => {
  try {
    res.json(await ensureLists());
  } catch (error) {
    console.error('Lists fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

router.post('/lists', coupleAuth, async (req, res) => {
  try {
    const name = parseListName(req.body?.name);
    if (!name) return res.status(400).json({ error: 'Give the list a name' });

    await ensureLists();
    const list = await prisma.noteList.create({ data: { name } });
    res.json(list);
  } catch (error) {
    console.error('List create error:', error);
    res.status(500).json({ error: 'Failed to add the list' });
  }
});

router.patch('/lists/:id', coupleAuth, async (req, res) => {
  try {
    const name = parseListName(req.body?.name);
    if (!name) return res.status(400).json({ error: 'Give the list a name' });

    const list = await prisma.noteList.update({ where: { id: req.params.id }, data: { name } });
    res.json(list);
  } catch (error) {
    console.error('List rename error:', error);
    res.status(500).json({ error: 'Failed to rename the list' });
  }
});

router.delete('/lists/:id', coupleAuth, async (req, res) => {
  try {
    const lists = await ensureLists();
    if (lists.length < 2) {
      return res.status(400).json({ error: 'That is the only list — keep it' });
    }
    if (!lists.some((list) => list.id === req.params.id)) {
      return res.status(404).json({ error: 'No such list' });
    }

    // The notes go with it; the confirm on the other end says how many
    await prisma.note.deleteMany({ where: { listId: req.params.id } });
    await prisma.noteList.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('List delete error:', error);
    res.status(500).json({ error: 'Failed to remove the list' });
  }
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

    // An unknown list would be a stale tab; put the note on the first list
    // rather than dropping what was just written.
    const lists = await ensureLists();
    const asked = typeof req.body?.listId === 'string' ? req.body.listId : null;
    const listId = lists.find((list) => list.id === asked)?.id ?? lists[0].id;

    const note = await prisma.note.create({
      data: { body, photoUrl, spinLabel, listId },
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
    if (typeof req.body?.listId === 'string') {
      const lists = await ensureLists();
      if (lists.some((list) => list.id === req.body.listId)) data.listId = req.body.listId;
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

// Photos are kept in our own database and served back from here. No third
// party involved, and the random id is the only way to reach one.
const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.post('/photo', coupleAuth, photoUpload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo provided' });

    const id = crypto.randomBytes(16).toString('hex');
    await prisma.usPhoto.create({
      data: { id, mime: req.file.mimetype, bytes: new Uint8Array(req.file.buffer) },
    });

    // Relative on purpose — the other end knows where the API lives
    res.json({ url: `/us/photo/${id}` });
  } catch (error: any) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Open, like the image URLs of any host would be — an <img> cannot carry the
// token. A 32-character random id is what keeps it unlisted.
router.get('/photo/:id', async (req, res) => {
  try {
    const photo = await prisma.usPhoto.findUnique({ where: { id: req.params.id } });
    if (!photo) return res.status(404).end();

    // Overrides the no-store above: the bytes at this id never change
    res.set('Cache-Control', 'private, max-age=31536000, immutable');
    res.type(photo.mime);
    res.send(Buffer.from(photo.bytes));
  } catch (error) {
    console.error('Photo fetch error:', error);
    res.status(500).end();
  }
});

export default router;
