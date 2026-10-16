// Fetches the cover of every saved Instagram link that does not have one yet.
// Instagram turns Railway's servers away, so run this from home:
//
//   DATABASE_URL="<Railway DATABASE_PUBLIC_URL>" npm run thumbs
//
// It only adds rows to UsLinkThumb; notes are read, never changed.
import prisma from '../src/lib/prisma.js';
import { fetchInstagramThumb, instagramCodes } from '../src/lib/links.js';

const notes = await prisma.note.findMany({
  where: { body: { contains: 'instagram.com' } },
  select: { body: true },
});
const codes = [...new Set(notes.flatMap((note) => instagramCodes(note.body)))];
const have = new Set(
  (await prisma.usLinkThumb.findMany({ select: { key: true } })).map((thumb) => thumb.key)
);

let added = 0;
for (const code of codes) {
  const key = `ig:${code}`;
  if (have.has(key)) continue;
  const thumb = await fetchInstagramThumb(code).catch(() => null);
  if (!thumb) {
    console.log(`no cover for ${code}`);
    continue;
  }
  await prisma.usLinkThumb.create({
    data: { key, mime: thumb.mime, bytes: new Uint8Array(thumb.bytes) },
  });
  added += 1;
  console.log(`saved ${code}`);
}
console.log(`${codes.length} links, ${added} new covers`);
await prisma.$disconnect();
