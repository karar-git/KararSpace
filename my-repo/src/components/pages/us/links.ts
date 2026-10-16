// Most notes on "for the future" are a pasted reel. Show them as a card with a
// label, and keep any words typed after the link as its caption.

const URL_RE = /https?:\/\/\S+/i;

export type LinkKind = 'reel' | 'post' | 'video' | 'link';

export interface FoundLink {
  url: string;
  kind: LinkKind;
  /** "instagram reel", "youtube video" … */
  label: string;
  /** Whatever was written around the link, or '' */
  caption: string;
}

const LABELS: Record<LinkKind, string> = {
  reel: 'instagram reel',
  post: 'instagram post',
  video: 'youtube video',
  link: 'a link',
};

export function findLink(body: string): FoundLink | null {
  const match = body.match(URL_RE);
  if (!match) return null;

  const url = match[0];
  let kind: LinkKind = 'link';
  if (/instagram\.com\/(reels?|tv)\//i.test(url)) kind = 'reel';
  else if (/instagram\.com\/p\//i.test(url)) kind = 'post';
  else if (/(youtube\.com|youtu\.be)\//i.test(url)) kind = 'video';

  const caption = body.replace(url, ' ').replace(/\s+/g, ' ').trim();
  return { url, kind, label: LABELS[kind], caption };
}

/** What to show as a note's text: the caption for a link, else the body. */
export function noteText(body: string): string {
  const link = findLink(body);
  if (!link) return body;
  return link.caption || (link.kind === 'video' ? 'a video we saved' : `a ${link.kind} we saved`);
}

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** 12 → "١٢" */
export function arabicNumber(value: number): string {
  return String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}
