import { Router } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { coupleAuth } from '../middleware/couple.js';

// Dates we went on: a place, a day, photos in order, and a note and a rating
// from each of us. Mounted under /api/us/dates.
const router = Router();
router.use(coupleAuth);

const AUTHORS = ['karar', 'dania'] as const;
const CATEGORIES = ['fun', 'romantic', 'food', 'place'] as const;
const MAX_PHOTOS = 30;

const include = {
  photos: { orderBy: { position: 'asc' as const } },
  notes: true,
  ratings: true,
};

const allDates = () =>
  prisma.usDate.findMany({
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    include,
  });

function parseAuthor(value: unknown): (typeof AUTHORS)[number] | null {
  return AUTHORS.find((author) => author === value) ?? null;
}

function parsePlace(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 120) : '';
}

/** undefined: not sent. null: cleared. */
function parseDay(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') return undefined;
  const day = new Date(value);
  return Number.isNaN(day.getTime()) ? undefined : day;
}

router.get('/', async (_req, res) => {
  try {
    res.json(await allDates());
  } catch (error) {
    console.error('Dates fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch our dates' });
  }
});

router.post('/', async (req, res) => {
  try {
    const place = parsePlace(req.body?.place);
    if (!place) return res.status(400).json({ error: 'Where did we go?' });
    const date = parseDay(req.body?.date) ?? null;

    // A new date goes on top of the thread
    const top = await prisma.usDate.aggregate({ _min: { position: true } });
    const created = await prisma.usDate.create({
      data: { place, date, position: (top._min.position ?? 1) - 1 },
      include,
    });
    res.json(created);
  } catch (error) {
    console.error('Date create error:', error);
    res.status(500).json({ error: 'Failed to keep that date' });
  }
});

router.put('/order', async (req, res) => {
  try {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.length > 1000 || !ids.every((id) => typeof id === 'string')) {
      return res.status(400).json({ error: 'That order does not look right' });
    }
    // Dragging a question-mark date into the thread is how it gets its number
    const placed = typeof req.body?.placed === 'string' ? req.body.placed : null;

    const dates = await prisma.usDate.findMany({
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      select: { id: true },
    });
    const known = new Set(dates.map((date) => date.id));
    const ordered = [
      ...ids.filter((id: string) => known.has(id)),
      ...dates.map((date) => date.id).filter((id) => !ids.includes(id)),
    ];
    await prisma.$transaction([
      ...ordered.map((id, position) => prisma.usDate.update({ where: { id }, data: { position } })),
      ...(placed && known.has(placed)
        ? [prisma.usDate.update({ where: { id: placed }, data: { numbered: true } })]
        : []),
    ]);
    res.json(await allDates());
  } catch (error) {
    console.error('Date order error:', error);
    res.status(500).json({ error: 'Failed to save the order' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const data: { place?: string; date?: Date | null; numbered?: boolean } = {};
    if (req.body?.place !== undefined) {
      const place = parsePlace(req.body.place);
      if (!place) return res.status(400).json({ error: 'Where did we go?' });
      data.place = place;
    }
    const day = parseDay(req.body?.date);
    if (day !== undefined) data.date = day;
    if (typeof req.body?.numbered === 'boolean') data.numbered = req.body.numbered;
    if (!Object.keys(data).length) return res.status(400).json({ error: 'Nothing to change' });

    res.json(await prisma.usDate.update({ where: { id: req.params.id }, data, include }));
  } catch (error) {
    console.error('Date update error:', error);
    res.status(500).json({ error: 'Failed to change that date' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Its photo rows, notes and ratings go with it. The image bytes stay in
    // UsPhoto, so nothing uploaded is ever lost.
    await prisma.usDate.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Date delete error:', error);
    res.status(500).json({ error: 'Failed to remove that date' });
  }
});

// The whole photo list in its new order. The first one is the cover.
router.put('/:id/photos', async (req, res) => {
  try {
    const photos = req.body?.photos;
    if (!Array.isArray(photos) || photos.length > MAX_PHOTOS) {
      return res.status(400).json({ error: `Up to ${MAX_PHOTOS} photos` });
    }
    const clean = photos
      .filter((photo) => photo && typeof photo.url === 'string' && photo.url.startsWith('/us/photo/'))
      .map((photo, position) => ({
        url: photo.url as string,
        caption: typeof photo.caption === 'string' ? photo.caption.trim().slice(0, 80) || null : null,
        position,
      }));

    const dateId = req.params.id;
    await prisma.$transaction([
      prisma.usDatePhoto.deleteMany({ where: { dateId } }),
      prisma.usDatePhoto.createMany({ data: clean.map((photo) => ({ ...photo, dateId })) }),
    ]);
    res.json(await prisma.usDate.findUnique({ where: { id: dateId }, include }));
  } catch (error) {
    console.error('Date photos error:', error);
    res.status(500).json({ error: 'Failed to save the photos' });
  }
});

router.put('/:id/notes/:author', async (req, res) => {
  try {
    const author = parseAuthor(req.params.author);
    if (!author) return res.status(400).json({ error: 'Karar or Dania?' });
    const body = typeof req.body?.body === 'string' ? req.body.body.trim().slice(0, 4000) : '';
    const dateId = req.params.id;

    if (!body) {
      await prisma.usDateNote.deleteMany({ where: { dateId, author } });
    } else {
      await prisma.usDateNote.upsert({
        where: { dateId_author: { dateId, author } },
        update: { body },
        create: { dateId, author, body },
      });
    }
    res.json(await prisma.usDate.findUnique({ where: { id: dateId }, include }));
  } catch (error) {
    console.error('Date note error:', error);
    res.status(500).json({ error: 'Failed to save the note' });
  }
});

// { fun: 4, romantic: 5, food: 0, place: 3 } — 0 clears a category
router.put('/:id/ratings/:author', async (req, res) => {
  try {
    const author = parseAuthor(req.params.author);
    if (!author) return res.status(400).json({ error: 'Karar or Dania?' });
    const dateId = req.params.id;

    const writes: Prisma.PrismaPromise<unknown>[] = [];
    for (const category of CATEGORIES) {
      const score = req.body?.[category];
      if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 5) continue;
      writes.push(
        score === 0
          ? prisma.usDateRating.deleteMany({ where: { dateId, author, category } })
          : prisma.usDateRating.upsert({
              where: { dateId_author_category: { dateId, author, category } },
              update: { score },
              create: { dateId, author, category, score },
            })
      );
    }
    if (!writes.length) return res.status(400).json({ error: 'Nothing to rate' });

    await prisma.$transaction(writes);
    res.json(await prisma.usDate.findUnique({ where: { id: dateId }, include }));
  } catch (error) {
    console.error('Date rating error:', error);
    res.status(500).json({ error: 'Failed to save the rating' });
  }
});

// ---- bring over a notes list that was used as a diary ----------------------
//
// Notes like "٣.الحلواني و مول المنصور ٢٢ أب" become dates. The notes
// themselves are only read, never changed, and a note that was copied once is
// never copied again.

const DIGITS = '٠١٢٣٤٥٦٧٨٩';
const toWestern = (text: string) =>
  text.replace(/[٠-٩]/g, (digit) => String(DIGITS.indexOf(digit)));

// Iraqi month names, with the spellings that turn up when typing fast.
// "اي" is how date ٤ was written; Karar confirmed it means آب.
const MONTHS: Array<[RegExp, number]> = [
  [/^كانون الثاني$|^كانون ٢$|^يناير$/, 0],
  [/^شباط$|^فبراير$/, 1],
  [/^[آا]ذار$|^مارس$/, 2],
  [/^نيسان$|^ابريل$|^أبريل$/, 3],
  [/^[أا]يار$|^مايو$/, 4],
  [/^حزيران$|^يونيو$/, 5],
  [/^تموز$|^يوليو$/, 6],
  [/^[آأا]ب$|^اي$|^أغسطس$|^اغسطس$/, 7],
  [/^[أا]يلول$|^سبتمبر$/, 8],
  [/^تشرين الأول$|^تشرين الاول$|^تشرين ١$|^أكتوبر$|^اكتوبر$/, 9],
  [/^تشرين الثاني$|^تشرين ٢$|^نوفمبر$/, 10],
  [/^كانون الأول$|^كانون الاول$|^كانون ١$|^ديسمبر$/, 11],
];

function monthOf(word: string): number | null {
  const found = MONTHS.find(([pattern]) => pattern.test(word.trim()));
  return found ? found[1] : null;
}

interface Parsed {
  noteId: string;
  number: number | null;
  place: string;
  date: Date | null;
}

export function parseDiaryNote(noteId: string, body: string, year: number): Parsed {
  let text = body.trim();
  let number: number | null = null;

  const numbered = text.match(/^([٠-٩0-9]+)\s*[.\-)]\s*(.*)$/s);
  if (numbered) {
    number = Number(toWestern(numbered[1]));
    text = numbered[2].trim();
  }

  // A trailing "<day> <month>", where the month is one word ("أيلول") or two
  // ("تشرين الأول")
  let date: Date | null = null;
  for (const pattern of [/\s([٠-٩0-9]{1,2})\s+(\S+\s\S+)$/, /\s([٠-٩0-9]{1,2})\s+(\S+)$/]) {
    const tail = text.match(pattern);
    const month = tail ? monthOf(tail[2]) : null;
    const day = tail ? Number(toWestern(tail[1])) : 0;
    if (tail && month !== null && day >= 1 && day <= 31) {
      // Noon UTC, so no timezone ever moves it to the day before
      date = new Date(Date.UTC(year, month, day, 12));
      text = text.slice(0, text.length - tail[0].length).trim();
      break;
    }
  }

  return { noteId, number, place: text || body.trim(), date };
}

router.post('/import', async (req, res) => {
  try {
    const listId = typeof req.body?.listId === 'string' ? req.body.listId : null;
    if (!listId) return res.status(400).json({ error: 'Which list?' });

    const notes = await prisma.note.findMany({
      where: { listId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, body: true },
    });
    const settings = await prisma.coupleSettings.findUnique({ where: { id: 'main' } });
    const year = (settings?.anniversary ?? new Date()).getUTCFullYear();

    const already = new Set(
      (await prisma.usDate.findMany({ select: { sourceNoteId: true } }))
        .map((date) => date.sourceNoteId)
        .filter(Boolean)
    );

    // The same number written twice is one date: keep the fullest version
    const byNumber = new Map<number, Parsed[]>();
    const loose: Parsed[] = [];
    for (const note of notes) {
      const parsed = parseDiaryNote(note.id, note.body, year);
      if (parsed.number === null) loose.push(parsed);
      else byNumber.set(parsed.number, [...(byNumber.get(parsed.number) ?? []), parsed]);
    }

    const picked: Parsed[] = [];
    for (const [, group] of [...byNumber.entries()].sort((a, b) => b[0] - a[0])) {
      if (group.some((parsed) => already.has(parsed.noteId))) continue;
      const best = [...group].sort(
        (a, b) => Number(!!b.date) - Number(!!a.date) || b.place.length - a.place.length
      )[0];
      picked.push(best);
    }
    const looseNew = loose.filter((parsed) => !already.has(parsed.noteId));

    // Highest number on top, the ones nobody numbered at the bottom
    const bottom = await prisma.usDate.aggregate({ _max: { position: true } });
    let position = (bottom._max.position ?? -1) + 1;
    const rows = [
      ...picked.map((parsed) => ({ ...parsed, numbered: true })),
      ...looseNew.map((parsed) => ({ ...parsed, numbered: false })),
    ].map((parsed) => ({
      place: parsed.place,
      date: parsed.date,
      numbered: parsed.numbered,
      sourceNoteId: parsed.noteId,
      position: position++,
    }));

    if (rows.length) await prisma.usDate.createMany({ data: rows });
    res.json({ added: rows.length, dates: await allDates() });
  } catch (error) {
    console.error('Date import error:', error);
    res.status(500).json({ error: 'Failed to bring the dates over' });
  }
});

export default router;
