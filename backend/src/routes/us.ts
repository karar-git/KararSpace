import { Router } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import prisma from '../lib/prisma.js';
import {
  checkPassword,
  coupleAuth,
  generateCoupleToken,
  isConfigured,
  setPassword,
} from '../middleware/couple.js';
import { findLink, isJunkLabel } from '../lib/links.js';
import datesRouter from './usDates.js';

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

  if (!(await isConfigured())) {
    return res.status(503).json({ error: 'not-configured' });
  }

  if (tooManyAttempts(ip)) {
    return res.status(429).json({ error: 'Too many tries. Wait a few minutes.' });
  }

  // Slow every attempt down a little, right or wrong
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (!(await checkPassword(req.body?.password))) {
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

// Change the shared password from the page itself
router.put('/password', coupleAuth, async (req, res) => {
  try {
    const current = typeof req.body?.current === 'string' ? req.body.current : '';
    const next = typeof req.body?.next === 'string' ? req.body.next.trim() : '';

    // Same deliberate pause as the unlock screen
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!(await checkPassword(current))) {
      return res.status(400).json({ error: 'the current one is not right' });
    }
    if (next.length < 4) {
      return res.status(400).json({ error: 'make it at least 4 characters' });
    }
    if (next.length > 200) {
      return res.status(400).json({ error: 'that is a very long password' });
    }
    if (await checkPassword(next)) {
      return res.status(400).json({ error: 'that is the one you already have' });
    }

    await setPassword(next);

    // A fresh token so this phone stays in; the other one asks for the new word
    res.json({ token: generateCoupleToken() });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change the password' });
  }
});

// ---- lists --------------------------------------------------------------

// The list every existing note belongs to, the first time this code runs
const FIRST_LIST_NAME = 'the date list';

const THEMES = ['deck', 'someday', 'places', 'ritual', 'dates'] as const;
type Theme = (typeof THEMES)[number];

// Lists made before themes existed get a look from their name. Nothing is
// written: a list keeps a null theme until someone picks one.
function guessTheme(name: string): Theme {
  const lower = name.toLowerCase();
  if (lower.includes('future') || lower.includes('someday')) return 'someday';
  if (lower.includes('place')) return 'places';
  if (name.includes('🪞') || lower.includes('ritual')) return 'ritual';
  if (name.includes('🦢') || lower.includes('our dates')) return 'dates';
  return 'deck';
}

function withTheme<T extends { name: string; theme: string | null }>(list: T) {
  return { ...list, theme: (list.theme as Theme | null) ?? guessTheme(list.name) };
}

// Once-per-boot housekeeping. Each step only fills in values that were never
// set, so running it again changes nothing.
let tidied = false;

async function tidyOnce(lists: { id: string; position: number }[]) {
  if (tidied) return;
  tidied = true;

  // Notes written before lists existed have a null listId; the first list adopts them
  await prisma.note.updateMany({ where: { listId: null }, data: { listId: lists[0].id } });

  // Positions arrived after the data did. A list whose notes all still sit at
  // 0 gets the order it always showed: newest first.
  if (lists.length > 1 && lists.every((list) => list.position === 0)) {
    await prisma.$transaction(
      lists.map((list, index) =>
        prisma.noteList.update({ where: { id: list.id }, data: { position: index } })
      )
    );
  }
  for (const list of lists) {
    const notes = await prisma.note.findMany({
      where: { listId: list.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, position: true },
    });
    if (notes.length > 1 && notes.every((note) => note.position === 0)) {
      await prisma.$transaction(
        notes.map((note, index) =>
          prisma.note.update({ where: { id: note.id }, data: { position: index } })
        )
      );
    }
  }

  // Link notes got wheel labels like "httpswwwinstagramcomreelDdIT"
  const junk = await prisma.note.findMany({
    where: { spinLabel: { startsWith: 'http' } },
    select: { id: true, body: true, spinLabel: true },
  });
  for (const note of junk) {
    if (!isJunkLabel(note.spinLabel)) continue;
    await prisma.note.update({ where: { id: note.id }, data: { spinLabel: deriveSpinLabel(note.body) } });
  }
}

async function ensureLists() {
  const order = [{ position: 'asc' as const }, { createdAt: 'asc' as const }];
  let lists = await prisma.noteList.findMany({ orderBy: order });

  if (!lists.length) {
    lists = [await prisma.noteList.create({ data: { name: FIRST_LIST_NAME } })];
  }

  if (!tidied) {
    try {
      await tidyOnce(lists);
    } catch (error) {
      // Never let housekeeping lock them out; it will try again next boot
      console.error('Tidy error:', error);
    }
    lists = await prisma.noteList.findMany({ orderBy: order });
  }

  return lists;
}

function parseListName(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 40) : '';
}

function parseTheme(value: unknown): Theme | null {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
    ? (value as Theme)
    : null;
}

function parseIds(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > 500) return null;
  if (!value.every((id) => typeof id === 'string')) return null;
  return value as string[];
}

router.get('/lists', coupleAuth, async (_req, res) => {
  try {
    res.json((await ensureLists()).map(withTheme));
  } catch (error) {
    console.error('Lists fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

router.post('/lists', coupleAuth, async (req, res) => {
  try {
    const name = parseListName(req.body?.name);
    if (!name) return res.status(400).json({ error: 'Give the list a name' });

    const lists = await ensureLists();
    const position = lists.reduce((max, list) => Math.max(max, list.position), -1) + 1;
    const theme = parseTheme(req.body?.theme);
    const list = await prisma.noteList.create({ data: { name, position, theme } });
    res.json(withTheme(list));
  } catch (error) {
    console.error('List create error:', error);
    res.status(500).json({ error: 'Failed to add the list' });
  }
});

// Put the chips in this order. Ids not listed keep their place after these.
router.put('/lists/order', coupleAuth, async (req, res) => {
  try {
    const ids = parseIds(req.body?.ids);
    if (!ids) return res.status(400).json({ error: 'That order does not look right' });

    const lists = await ensureLists();
    const known = new Set(lists.map((list) => list.id));
    const ordered = [
      ...ids.filter((id) => known.has(id)),
      ...lists.map((list) => list.id).filter((id) => !ids.includes(id)),
    ];
    await prisma.$transaction(
      ordered.map((id, position) => prisma.noteList.update({ where: { id }, data: { position } }))
    );
    res.json((await ensureLists()).map(withTheme));
  } catch (error) {
    console.error('List order error:', error);
    res.status(500).json({ error: 'Failed to save the order' });
  }
});

router.patch('/lists/:id', coupleAuth, async (req, res) => {
  try {
    const data: { name?: string; theme?: Theme } = {};
    if (req.body?.name !== undefined) {
      const name = parseListName(req.body.name);
      if (!name) return res.status(400).json({ error: 'Give the list a name' });
      data.name = name;
    }
    if (req.body?.theme !== undefined) {
      const theme = parseTheme(req.body.theme);
      if (!theme) return res.status(400).json({ error: 'No such look' });
      data.theme = theme;
    }
    if (!Object.keys(data).length) return res.status(400).json({ error: 'Nothing to change' });

    const list = await prisma.noteList.update({ where: { id: req.params.id }, data });
    res.json(withTheme(list));
  } catch (error) {
    console.error('List update error:', error);
    res.status(500).json({ error: 'Failed to change the list' });
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
  const link = findLink(body);
  if (link && !link.caption) return link.kind === 'video' ? 'video' : link.kind;
  const words = (link ? link.caption : body)
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}'-]/gu, ''))
    .filter(Boolean);

  let start = 0;
  while (start < words.length - 1 && FILLER.has(words[start].toLowerCase())) start += 1;

  const picked = words.slice(start, start + 2);
  return picked.join('\n').slice(0, 28);
}

// New notes go on top of their list
async function topPosition(listId: string): Promise<number> {
  const top = await prisma.note.aggregate({ where: { listId }, _min: { position: true } });
  return (top._min.position ?? 1) - 1;
}

router.get('/notes', coupleAuth, async (_req, res) => {
  try {
    const notes = await prisma.note.findMany({
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });
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
      data: { body, photoUrl, spinLabel, listId, position: await topPosition(listId) },
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
      if (lists.some((list) => list.id === req.body.listId)) {
        // A note moved to another list arrives at the top of it
        data.listId = req.body.listId;
        data.position = await topPosition(req.body.listId);
      }
    }
    for (const key of ['mapX', 'mapY'] as const) {
      const value = req.body?.[key];
      if (value === null) data[key] = null;
      else if (typeof value === 'number' && Number.isFinite(value)) {
        data[key] = Math.min(1, Math.max(0, value));
      }
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

// Put one list's notes in this order, in one request
router.put('/notes/order', coupleAuth, async (req, res) => {
  try {
    const ids = parseIds(req.body?.ids);
    const listId = typeof req.body?.listId === 'string' ? req.body.listId : null;
    if (!ids || !listId) return res.status(400).json({ error: 'That order does not look right' });

    const notes = await prisma.note.findMany({
      where: { listId },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      select: { id: true },
    });
    const known = new Set(notes.map((note) => note.id));
    // A note added on the other phone mid-drag keeps its place at the end
    const ordered = [
      ...ids.filter((id) => known.has(id)),
      ...notes.map((note) => note.id).filter((id) => !ids.includes(id)),
    ];
    await prisma.$transaction(
      ordered.map((id, position) => prisma.note.update({ where: { id }, data: { position } }))
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Note order error:', error);
    res.status(500).json({ error: 'Failed to save the order' });
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
      return res.json({
        id: 'main',
        ...DEFAULTS,
        anniversary: null,
        nextDate: null,
        photoViewer: null,
        dateView: null,
      });
    }
    // A row saved before the names existed still answers with something.
    // The password hash never leaves the server.
    const { passwordHash: _hash, ...visible } = settings;
    res.json({
      ...visible,
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

// How photos open and how dates are shown. Its own route, so changing a view
// can never touch the names or the anniversary.
const PHOTO_VIEWERS = ['stack', 'film', 'polaroids'];
const DATE_VIEWS = ['thread', 'book', 'calendar'];

router.put('/settings/views', coupleAuth, async (req, res) => {
  try {
    const data: { photoViewer?: string; dateView?: string } = {};
    if (PHOTO_VIEWERS.includes(req.body?.photoViewer)) data.photoViewer = req.body.photoViewer;
    if (DATE_VIEWS.includes(req.body?.dateView)) data.dateView = req.body.dateView;
    if (!Object.keys(data).length) return res.status(400).json({ error: 'Nothing to change' });

    await prisma.coupleSettings.upsert({
      where: { id: 'main' },
      update: data,
      create: { id: 'main', ...data },
    });
    res.json(data);
  } catch (error) {
    console.error('Views update error:', error);
    res.status(500).json({ error: 'Failed to save that' });
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

router.use('/dates', datesRouter);

export default router;
