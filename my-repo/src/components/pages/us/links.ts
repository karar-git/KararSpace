import { API_BASE } from './api';

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
  /** A picture for the card, if the link has one we can show */
  thumb: string | null;
  /** A player that can sit inside our page */
  embed: string | null;
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
  let thumb: string | null = null;
  let embed: string | null = null;

  const youtube = url.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{11})/);
  const instagram = url.match(/instagram\.com\/(?:reels?|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (kind === 'video' && youtube) {
    thumb = `https://i.ytimg.com/vi/${youtube[1]}/hqdefault.jpg`;
    embed = `https://www.youtube-nocookie.com/embed/${youtube[1]}?autoplay=1&playsinline=1&rel=0`;
  } else if (instagram) {
    // Our API keeps a copy of the cover; Instagram's own image links expire
    thumb = `${API_BASE}/thumb/ig/${instagram[1]}`;
    embed = `https://www.instagram.com/${kind === 'post' ? 'p' : 'reel'}/${instagram[1]}/embed/`;
  }

  return { url, kind, label: LABELS[kind], caption, thumb, embed };
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
