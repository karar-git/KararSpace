const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function daysBetween(from: string | Date, to: Date = new Date()): number {
  const start = startOfDay(new Date(from));
  const end = startOfDay(to);
  return Math.max(0, Math.round((end - start) / 86400000));
}

/** "added tuesday" for this week, "added 4 march" once it is older. */
export function addedTag(createdAt: string): string {
  const date = new Date(createdAt);
  const days = daysBetween(createdAt);
  if (days === 0) return 'added today';
  if (days === 1) return 'added yesterday';
  if (days < 7) return `added ${DAY_NAMES[date.getDay()]}`;
  return `added ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "4 march 2024" */
export function prettyDate(value: string | Date): string {
  const date = new Date(value);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** yyyy-mm-dd, for <input type="date"> */
export function toDateInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
