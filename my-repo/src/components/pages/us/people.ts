import type { Author, Category, Scores, UsDate } from './api';

// Everyone shares one password, so "who is holding this phone" is asked once
// and remembered here. Honour system, and that is fine.
const ME_KEY = 'us:me';
const RITUAL_KEY = 'us:ritual';

export const AUTHORS: Author[] = ['karar', 'dania'];
export const AUTHOR_NAME: Record<Author, string> = { karar: 'Karar', dania: 'Dania' };
export const AUTHOR_COLOR: Record<Author, string> = { karar: '#b5536f', dania: '#7b5ea7' };
export const other = (author: Author): Author => (author === 'karar' ? 'dania' : 'karar');

/** «اكتب» for him, «اكتبي» for her */
export const NOTE_PROMPT: Record<Author, string> = {
  karar: 'اكتب شي عن هاليوم…',
  dania: 'اكتبي شي عن هاليوم…',
};

export const CATEGORIES: Array<{ key: Category; label: string }> = [
  { key: 'fun', label: 'have fun' },
  { key: 'romantic', label: 'romantic' },
  { key: 'food', label: 'food' },
  { key: 'place', label: 'المكان' },
];

export const EMPTY_SCORES: Scores = { fun: 0, romantic: 0, food: 0, place: 0 };

export function getMe(): Author | null {
  try {
    const value = localStorage.getItem(ME_KEY);
    return value === 'karar' || value === 'dania' ? value : null;
  } catch {
    return null;
  }
}

export function setMe(author: Author) {
  try {
    localStorage.setItem(ME_KEY, author);
  } catch {
    /* private mode — it will ask again next time */
  }
}

/** Tonight's ratings from the ritual, kept on this phone until they are saved to a date */
export type RitualDraft = Record<Author, Scores>;

export function loadRitual(): RitualDraft {
  try {
    const parsed = JSON.parse(localStorage.getItem(RITUAL_KEY) || 'null');
    if (parsed && parsed.karar && parsed.dania) {
      return { karar: { ...EMPTY_SCORES, ...parsed.karar }, dania: { ...EMPTY_SCORES, ...parsed.dania } };
    }
  } catch {
    /* nothing saved, or unreadable */
  }
  return { karar: { ...EMPTY_SCORES }, dania: { ...EMPTY_SCORES } };
}

export function saveRitual(draft: RitualDraft) {
  try {
    localStorage.setItem(RITUAL_KEY, JSON.stringify(draft));
  } catch {
    /* private mode */
  }
}

export const hasScores = (scores: Scores) => Object.values(scores).some((score) => score > 0);

export function average(scores: number[]): number {
  const given = scores.filter((score) => score > 0);
  return given.length ? given.reduce((sum, score) => sum + score, 0) / given.length : 0;
}

/** The average of every heart either of us gave a date, or 0 */
export function dateAverage(date: UsDate): number {
  return average(date.ratings.map((rating) => rating.score));
}

export function scoresFor(date: UsDate, author: Author): Scores {
  const scores = { ...EMPTY_SCORES };
  date.ratings
    .filter((rating) => rating.author === author)
    .forEach((rating) => {
      scores[rating.category] = rating.score;
    });
  return scores;
}
