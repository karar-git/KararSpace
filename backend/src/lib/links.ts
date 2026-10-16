// Notes on the private page are often a pasted Instagram or YouTube link with a
// few words after it. These helpers tell the two apart.

const URL_RE = /https?:\/\/\S+/i;

export type LinkKind = 'reel' | 'post' | 'video' | 'link';

export function findLink(body: string): { url: string; kind: LinkKind; caption: string } | null {
  const match = body.match(URL_RE);
  if (!match) return null;

  const url = match[0];
  let kind: LinkKind = 'link';
  if (/instagram\.com\/(reels?|tv)\//i.test(url)) kind = 'reel';
  else if (/instagram\.com\/p\//i.test(url)) kind = 'post';
  else if (/(youtube\.com|youtu\.be)\//i.test(url)) kind = 'video';

  const caption = body.replace(url, ' ').replace(/\s+/g, ' ').trim();
  return { url, kind, caption };
}

/** A wheel label that came from a raw URL, like "httpswwwinstagramcomreelDdIT". */
export function isJunkLabel(label: string | null): boolean {
  return !!label && /^https?/i.test(label.replace(/\s/g, ''));
}

// Instagram shows link-preview crawlers a post's cover image. It sends cloud
// servers to its login page instead, so this only works from a home connection.
const CRAWLER_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const MAX_THUMB_BYTES = 5 * 1024 * 1024;

/** Every Instagram shortcode in a note body */
export function instagramCodes(body: string): string[] {
  return [...body.matchAll(/instagram\.com\/(?:reels?|p|tv)\/([A-Za-z0-9_-]+)/gi)].map((m) => m[1]);
}

export async function fetchInstagramThumb(code: string): Promise<{ mime: string; bytes: Buffer } | null> {
  const page = await fetch(`https://www.instagram.com/p/${code}/`, {
    headers: { 'User-Agent': CRAWLER_UA, 'Accept-Language': 'en' },
    signal: AbortSignal.timeout(20000),
  });
  if (!page.ok) return null;
  const html = await page.text();
  const match = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
  if (!match) return null;
  const imageUrl = match[1].replace(/&amp;/g, '&');
  if (!/^https:\/\/[^/]+\.(cdninstagram\.com|fbcdn\.net)\//.test(imageUrl)) return null;

  const image = await fetch(imageUrl, { signal: AbortSignal.timeout(20000) });
  const mime = image.headers.get('content-type') || '';
  if (!image.ok || !mime.startsWith('image/')) return null;
  const bytes = Buffer.from(await image.arrayBuffer());
  if (bytes.length > MAX_THUMB_BYTES) return null;
  return { mime, bytes };
}
