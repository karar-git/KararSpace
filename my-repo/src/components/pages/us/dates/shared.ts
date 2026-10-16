import type { CSSProperties } from 'react';
import { arabicNumber } from '../links';
import { photoSrc, type UsDate } from '../api';

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/**
 * The thread is newest on top, so the bottom numbered date is ١. A date that
 * was never placed shows ؟ and does not count.
 */
export function dateNumbers(dates: UsDate[]): Map<string, string> {
  const numbered = dates.filter((date) => date.numbered);
  const labels = new Map<string, string>();
  dates.forEach((date) => {
    labels.set(
      date.id,
      date.numbered ? arabicNumber(numbered.length - numbered.indexOf(date)) : '؟'
    );
  });
  return labels;
}

/** The number a new date would get */
export const nextNumber = (dates: UsDate[]) =>
  arabicNumber(dates.filter((date) => date.numbered).length + 1);

/** "21 september". Dates are stored at noon UTC, so read them in UTC. */
export function dayLabel(value: string | null): string {
  if (!value) return 'date unknown';
  const date = new Date(value);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

export function dayParts(value: string): { year: number; month: number; day: number } {
  const date = new Date(value);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate() };
}

/** yyyy-mm-dd for <input type="date"> */
export function toInput(value: string | null): string {
  if (!value) return '';
  const { year, month, day } = dayParts(value);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** From <input type="date"> back to noon UTC */
export function fromInput(value: string): string | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).toISOString();
}

export const MONTH_NAMES = MONTHS;

// Soft colour fields that stand in for a photo until there is one
const PLACEHOLDERS: Array<[string, string]> = [
  ['#f9c9d8', '#ec95b3'], ['#fde0cc', '#f2ab83'], ['#e7dcf8', '#b9a3ea'],
  ['#d4eee3', '#93ccb6'], ['#fff0c4', '#efcd74'], ['#f6d3e6', '#d79ac0'],
];

export function placeholder(index: number): CSSProperties {
  const [from, to] = PLACEHOLDERS[((index % PLACEHOLDERS.length) + PLACEHOLDERS.length) % PLACEHOLDERS.length];
  return { background: `linear-gradient(150deg, ${from}, ${to})` };
}

/** A photo as a background, or a colour field when there is none */
export function photoBg(url: string | undefined, fallback: number): CSSProperties {
  return url
    ? { backgroundImage: `url("${photoSrc(url)}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : placeholder(fallback);
}
