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
