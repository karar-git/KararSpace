import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import './us.css';
import './us2.css';
import { Heart, HeartOutline } from './icons';
import NotePanel from './NotePanel';
import Wheel from './Wheel';
import { Segmented } from './bits';
import type { NoteActions } from './NoteSheet';
import DeckView from './views/DeckView';
import ArrangeView from './views/ArrangeView';
import FutureView from './views/FutureView';
import PlacesView from './views/PlacesView';
import RitualView from './views/RitualView';
import DatesView from './dates/DatesView';
import DateEditor from './dates/DateEditor';
import PhotoViewer from './dates/PhotoViewer';
import { dateNumbers, nextNumber } from './dates/shared';
import { dragging } from './useReorder';
import {
  AUTHOR_NAME,
  EMPTY_SCORES,
  getMe,
  hasScores,
  saveRitual,
  setMe as rememberMe,
  type RitualDraft,
} from './people';
import { daysBetween, prettyDate, toDateInput } from './dates';
import {
  LockedError,
  addList,
  addNote,
  changePassword,
  checkSession,
  deleteList,
  deleteNote,
  getSettings,
  getToken,
  importDates,
  listDates,
  listLists,
  listNotes,
  reorderDates,
  reorderLists,
  reorderNotes,
  saveDatePhotos,
  saveDateRatings,
  saveSettings,
  saveViews,
  setToken,
  unlock,
  updateList,
  updateNote,
  type Author,
  type DateView,
  type Note,
  type NoteList,
  type PhotoViewer as PhotoViewerKind,
  type Settings,
  type Theme,
  type UsDate,
  type Views,
} from './api';

type Screen = 'list' | 'spin' | 'done' | 'arrange';

const POLL_MS = 7000;
const LIST_KEY = 'us:list';
const MAX_SEGMENTS = 6;
const DEFAULT_NAMES = { nameOne: 'karar', nameTwo: 'dania' };
const FONTS =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Quicksand:wght@400;500;600;700' +
  '&family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@400;500;700' +
  '&family=Caveat:wght@500;600&family=Aref+Ruqaa:wght@400;700&display=swap';

const byPosition = (a: { position: number; createdAt: string }, b: { position: number; createdAt: string }) =>
  a.position - b.position || b.createdAt.localeCompare(a.createdAt);

/* ------------------------------------------------------------------ */

function BackgroundHearts() {
  const spots: Array<CSSProperties & { size: number }> = [
    { top: '8%', left: '6%', size: 84 },
    { top: '22%', right: '8%', size: 54 },
    { top: '58%', left: '3%', size: 42 },
    { bottom: '12%', right: '10%', size: 76 },
    { bottom: '32%', left: '14%', size: 34 },
  ];
  return (
    <div className="us-bg" aria-hidden="true">
      {spots.map(({ size, ...style }, index) => (
        <span key={index} style={style}>
          <Heart size={size} fill="currentColor" />
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function LockScreen({ onUnlocked }: { onUnlocked: () => void }) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await unlock(value);
      onUnlocked();
    } catch (err) {
      const message = (err as Error).message;
      setError(
        message === 'not-configured'
          ? 'the password has not been set on the server yet'
          : message
      );
      setValue('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="us-root">
      <BackgroundHearts />
      <div className="us-lock">
        <form className="us-lock-card" onSubmit={submit}>
          <Heart size={40} fill="var(--accent)" className="us-beat" />
          <h1>hey you</h1>
          <p>only two people know this one</p>
          <input
            className="us-lock-input"
            type="password"
            autoFocus
            autoComplete="off"
            placeholder="· · · · · · ·"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button className="us-lock-btn" type="submit" disabled={busy || !value.trim()}>
            {busy ? 'checking…' : 'let me in'}
          </button>
          {error && <div className="us-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function DayCounter({
  settings,
  onEdit,
}: {
  settings: Settings | null;
  onEdit: () => void;
}) {
  const days = settings?.anniversary ? daysBetween(settings.anniversary) : null;

  return (
    <div className="us-counter">
      <div className="us-counter-left">
        <div className="us-heartnum">
          <HeartOutline color="var(--card-border-active)" />
          <b style={days !== null && days > 999 ? { fontSize: 25 } : undefined}>
            {days === null ? '—' : days}
          </b>
        </div>
        <div>
          <div className="us-counter-label">days of us</div>
          <div className="us-counter-sub">
            {settings?.anniversary ? `since ${prettyDate(settings.anniversary)}` : 'no date yet'}
          </div>
          <button type="button" className="us-linkish" onClick={onEdit}>
            {settings?.anniversary ? 'edit' : 'set our day'}
          </button>
        </div>
      </div>
      <div className="us-counter-right">
        <div className="us-eyebrow">next one</div>
        <p>{settings?.nextDate || 'soon'}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ListBar({
  lists,
  activeId,
  counts,
  onPick,
  onNew,
}: {
  lists: NoteList[];
  activeId: string | null;
  counts: Record<string, number>;
  onPick: (id: string) => void;
  onNew: () => void;
}) {
  if (!lists.length) return null;

  return (
    <div className="us-lists">
      <div className="us-lists-scroll">
        {lists.map((list) => (
          <button
            key={list.id}
            type="button"
            className={list.id === activeId ? 'us-listpill on' : 'us-listpill'}
            onClick={() => onPick(list.id)}
          >
            {list.name}
            {counts[list.id] ? <span className="us-listpill-count">{counts[list.id]}</span> : null}
          </button>
        ))}
      </div>
      <button type="button" className="us-listpill add" title="new list" onClick={onNew}>
        + list
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

// Its own little form: saving the names should never be able to change the
// password by accident, and vice versa.
function PasswordSection() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ good: boolean; text: string } | null>(null);

  if (!open) {
    return (
      <div className="us-pw">
        <button type="button" className="us-linkish" onClick={() => setOpen(true)}>
          change our password
        </button>
      </div>
    );
  }

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      await changePassword(current, next);
      setCurrent('');
      setNext('');
      setNote({ good: true, text: 'changed. tell the other one.' });
    } catch (err) {
      setNote({ good: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="us-pw open">
      <div className="us-pw-head">
        <span>our password</span>
        <button type="button" className="us-linkish" onClick={() => setOpen(false)}>
          not now
        </button>
      </div>
      <label className="us-field">
        <span>the one we use now</span>
        <input
          type="password"
          autoComplete="off"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
        />
      </label>
      <label className="us-field">
        <span>the new one</span>
        <input
          type="password"
          autoComplete="off"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
          }}
        />
      </label>
      <p className="us-pw-hint">
        this phone stays open. the other one will ask for the new word.
      </p>
      <div className="us-panel-actions">
        <button
          type="button"
          className="us-pill"
          disabled={busy || !current.trim() || !next.trim()}
          onClick={submit}
        >
          {busy ? 'changing…' : 'change it'}
        </button>
      </div>
      {note && <div className={note.good ? 'us-pw-note good' : 'us-pw-note'}>{note.text}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SettingsModal({
  settings,
  onClose,
  onSave,
}: {
  settings: Settings | null;
  onClose: () => void;
  onSave: (next: Settings) => Promise<void>;
}) {
  const [nameOne, setNameOne] = useState(settings?.nameOne ?? '');
  const [nameTwo, setNameTwo] = useState(settings?.nameTwo ?? '');
  const [anniversary, setAnniversary] = useState(toDateInput(settings?.anniversary ?? null));
  const [nextDate, setNextDate] = useState(settings?.nextDate ?? '');
  const [busy, setBusy] = useState(false);

  return (
    <div className="us-modal" onClick={onClose}>
      <div className="us-modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>us</h3>
        <div className="us-field-pair">
          <label className="us-field">
            <span>name on the left</span>
            <input
              type="text"
              maxLength={24}
              placeholder="karar"
              value={nameOne}
              onChange={(event) => setNameOne(event.target.value)}
            />
          </label>
          <label className="us-field">
            <span>name on the right</span>
            <input
              type="text"
              maxLength={24}
              placeholder="dania"
              value={nameTwo}
              onChange={(event) => setNameTwo(event.target.value)}
            />
          </label>
        </div>
        <label className="us-field">
          <span>the day it started</span>
          <input
            type="date"
            value={anniversary}
            onChange={(event) => setAnniversary(event.target.value)}
          />
        </label>
        <label className="us-field">
          <span>next one</span>
          <input
            type="text"
            placeholder="friday"
            value={nextDate}
            onChange={(event) => setNextDate(event.target.value)}
          />
        </label>
        <PasswordSection />
        <div className="us-panel-actions">
          <button
            type="button"
            className="us-pill filled"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onSave({
                nameOne: nameOne.trim() || 'karar',
                nameTwo: nameTwo.trim() || 'dania',
                anniversary: anniversary ? new Date(anniversary).toISOString() : null,
                nextDate: nextDate.trim() || null,
              });
              setBusy(false);
            }}
          >
            save
          </button>
          <button type="button" className="us-pill ghost" onClick={onClose}>
            cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function WhoAreYou({ onPick }: { onPick: (author: Author) => void }) {
  return (
    <div className="us-modal">
      <div className="us-modal-card us2-who">
        <Heart size={30} fill="var(--accent)" className="us-beat" />
        <h3>who are you?</h3>
        <p>so your notes and hearts land on your side. this phone remembers.</p>
        <div className="us-panel-actions" style={{ justifyContent: 'center' }}>
          <button type="button" className="us-pill filled" onClick={() => onPick('karar')}>
            {AUTHOR_NAME.karar}
          </button>
          <button type="button" className="us-pill filled dania" onClick={() => onPick('dania')}>
            {AUTHOR_NAME.dania}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function UsPage() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [lists, setLists] = useState<NoteList[]>([]);
  const [dates, setDates] = useState<UsDate[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LIST_KEY);
    } catch {
      return null;
    }
  });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [views, setViews] = useState<Views>({ photoViewer: null, dateView: null });
  const [screen, setScreen] = useState<Screen>('list');
  const [result, setResult] = useState<Note | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [me, setMe] = useState<Author | null>(getMe);
  const [editor, setEditor] = useState<{ date: UsDate | null; ritual: boolean; day?: string } | null>(null);
  const [viewer, setViewer] = useState<{ dateId: string; index: number } | null>(null);

  // Keep this page out of search engines and off the site's usual title
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow, noarchive';
    document.head.appendChild(meta);

    // The serif and UI fonts have no Arabic letters; Amiri, Tajawal and
    // Aref Ruqaa cover those so notes do not fall back to the phone's default
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = FONTS;
    document.head.appendChild(fonts);

    const previousTitle = document.title;
    document.title = 'us';

    return () => {
      meta.remove();
      fonts.remove();
      document.title = previousTitle;
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast((current) => (current === message ? null : current)), 2600);
  }, []);

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof LockedError) {
        setUnlocked(false);
        return;
      }
      showToast((err as Error).message || 'that did not work');
    },
    [showToast]
  );

  // Is the saved session still valid?
  useEffect(() => {
    if (!getToken()) {
      setUnlocked(false);
      return;
    }
    checkSession()
      .then(() => setUnlocked(true))
      .catch(() => setUnlocked(false));
  }, []);

  // While a write or a drag is in flight, let the optimistic state stand
  const writing = useRef(0);

  const refresh = useCallback(async () => {
    if (writing.current > 0 || dragging.active) return;
    try {
      const [freshNotes, freshSettings, freshLists, freshDates] = await Promise.all([
        listNotes(),
        getSettings(),
        listLists(),
        listDates(),
      ]);
      if (writing.current > 0 || dragging.active) return;
      setAllNotes(freshNotes);
      setSettings(freshSettings);
      setViews({ photoViewer: freshSettings.photoViewer, dateView: freshSettings.dateView });
      setLists(freshLists);
      setDates(freshDates);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  /** Run a write with the polling loop held off, and re-read if it fails */
  const write = useCallback(
    async (task: () => Promise<unknown>) => {
      writing.current += 1;
      try {
        await task();
      } catch (err) {
        handleError(err);
        writing.current -= 1;
        refresh();
        return false;
      }
      writing.current -= 1;
      return true;
    },
    [handleError, refresh]
  );

  // Two phones, one list — poll while the tab is open
  useEffect(() => {
    if (!unlocked) return;
    refresh();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [unlocked, refresh]);

  // A list id from another phone or a removed list falls back to the first
  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId) ?? lists[0] ?? null,
    [lists, activeListId]
  );
  const theme: Theme = activeList?.theme ?? 'deck';

  // The list "plan it" and "add to a date" send things to
  const deckList = useMemo(
    () =>
      lists.find((list) => list.theme === 'deck' && list.name === 'the date list') ??
      lists.find((list) => list.theme === 'deck') ??
      null,
    [lists]
  );

  // Everything below this line works on one list at a time, top first
  const notes = useMemo(
    () =>
      activeList
        ? allNotes.filter((note) => note.listId === activeList.id).sort(byPosition)
        : [],
    [allNotes, activeList]
  );

  const listCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allNotes.forEach((note) => {
      if (note.listId && !note.done) counts[note.listId] = (counts[note.listId] ?? 0) + 1;
    });
    lists.forEach((list) => {
      if (list.theme === 'dates') counts[list.id] = dates.length;
    });
    return counts;
  }, [allNotes, lists, dates.length]);

  const open = useMemo(() => notes.filter((note) => !note.done), [notes]);
  const doneNotes = useMemo(() => notes.filter((note) => note.done), [notes]);

  // Up to six segments: what comes up next first, then hearted ones to fill
  const segments = useMemo(
    () => [...open, ...doneNotes].slice(0, MAX_SEGMENTS),
    [open, doneNotes]
  );

  const names = {
    nameOne: settings?.nameOne || DEFAULT_NAMES.nameOne,
    nameTwo: settings?.nameTwo || DEFAULT_NAMES.nameTwo,
  };

  const needsMe = !me && (theme === 'dates' || theme === 'ritual');

  /* ---- notes ---- */

  const patchLocal = (id: string, patch: Partial<Note>) =>
    setAllNotes((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const toggleDone = (note: Note) => {
    const next = !note.done;
    // Optimistic — the heart should fill the instant it is tapped
    patchLocal(note.id, { done: next, doneAt: next ? new Date().toISOString() : null });
    setResult((current) => (current && current.id === note.id ? { ...current, done: next } : current));
    write(() => updateNote(note.id, { done: next }));
  };

  const add = async (body: string, photoUrl: string | null, listId = activeList?.id ?? null) => {
    const note = await addNote({ body, photoUrl, listId });
    setAllNotes((current) => [note, ...current]);
    return note;
  };

  const remove = async (note: Note) => {
    if (!window.confirm('remove this note?')) return;
    try {
      await deleteNote(note.id);
      setAllNotes((current) => current.filter((item) => item.id !== note.id));
      setResult((current) => (current && current.id === note.id ? null : current));
    } catch (err) {
      handleError(err);
    }
  };

  const editLabel = async (note: Note) => {
    const current = note.spinLabel?.replace('\n', ' ') ?? '';
    const next = window.prompt('two short words for the wheel', current);
    if (next === null) return;
    const spinLabel = next.trim().split(/\s+/).slice(0, 2).join('\n');
    try {
      const updated = await updateNote(note.id, { spinLabel });
      setAllNotes((all) => all.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      handleError(err);
    }
  };

  const editBody = async (note: Note) => {
    const next = window.prompt('change this note', note.body);
    if (next === null || !next.trim() || next.trim() === note.body) return;
    try {
      const updated = await updateNote(note.id, { body: next.trim() });
      setAllNotes((all) => all.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      handleError(err);
    }
  };

  const actions: NoteActions = {
    onToggleDone: toggleDone,
    onDelete: remove,
    onEditLabel: editLabel,
    onEditBody: editBody,
  };

  const arrangeNotes = (next: Note[]) => {
    if (!activeList) return;
    const position = new Map(next.map((note, index) => [note.id, index]));
    setAllNotes((current) =>
      current.map((note) => (position.has(note.id) ? { ...note, position: position.get(note.id)! } : note))
    );
    write(() => reorderNotes(activeList.id, next.map((note) => note.id)));
  };

  // "plan it": a someday moves to the top of the date list
  const plan = (note: Note) => {
    if (!deckList) return;
    const top = Math.min(0, ...allNotes.filter((n) => n.listId === deckList.id).map((n) => n.position)) - 1;
    patchLocal(note.id, { listId: deckList.id, position: top });
    showToast(`moved to ${deckList.name}`);
    write(() => updateNote(note.id, { listId: deckList.id }));
  };

  const copyToDates = async (note: Note) => {
    if (!deckList) return;
    try {
      await add(note.body, note.photoUrl, deckList.id);
      showToast(`added to ${deckList.name}`);
    } catch (err) {
      handleError(err);
    }
  };

  const addPlace = async (body: string, at: [number, number]) => {
    try {
      const note = await add(body, null);
      patchLocal(note.id, { mapX: at[0], mapY: at[1] });
      await updateNote(note.id, { mapX: at[0], mapY: at[1] });
    } catch (err) {
      handleError(err);
    }
  };

  const movePin = (note: Note, at: [number, number]) => {
    patchLocal(note.id, { mapX: at[0], mapY: at[1] });
    write(() => updateNote(note.id, { mapX: at[0], mapY: at[1] }));
  };

  /* ---- lists ---- */

  const chooseList = (id: string) => {
    setActiveListId(id);
    setResult(null);
    setScreen('list');
    try {
      localStorage.setItem(LIST_KEY, id);
    } catch {
      /* private mode — it just will not be remembered */
    }
  };

  const createList = async () => {
    const name = window.prompt('name for the new list');
    if (name === null || !name.trim()) return;
    try {
      const created = await addList(name.trim());
      setLists((current) => [...current, created]);
      chooseList(created.id);
    } catch (err) {
      handleError(err);
    }
  };

  const renameActiveList = async () => {
    if (!activeList) return;
    const name = window.prompt('rename this list', activeList.name);
    if (name === null || !name.trim()) return;
    try {
      const updated = await updateList(activeList.id, { name: name.trim() });
      setLists((current) => current.map((list) => (list.id === updated.id ? updated : list)));
    } catch (err) {
      handleError(err);
    }
  };

  const setActiveTheme = (next: Theme) => {
    if (!activeList) return;
    setLists((current) => current.map((list) => (list.id === activeList.id ? { ...list, theme: next } : list)));
    write(() => updateList(activeList.id, { theme: next }));
  };

  const arrangeLists = (next: NoteList[]) => {
    setLists(next.map((list, position) => ({ ...list, position })));
    write(() => reorderLists(next.map((list) => list.id)));
  };

  const removeActiveList = async () => {
    if (!activeList || lists.length < 2) return;
    const count = notes.length;
    const question = count
      ? `remove "${activeList.name}" and its ${count} note${count === 1 ? '' : 's'}?`
      : `remove "${activeList.name}"?`;
    if (!window.confirm(question)) return;

    const gone = activeList.id;
    try {
      await deleteList(gone);
      const rest = lists.filter((list) => list.id !== gone);
      setAllNotes((current) => current.filter((note) => note.listId !== gone));
      setLists(rest);
      chooseList(rest[0].id);
    } catch (err) {
      handleError(err);
    }
  };

  /* ---- dates ---- */

  const numbers = useMemo(() => dateNumbers(dates), [dates]);

  // A "dates" list whose notes were never copied into real dates. Copying only
  // reads them; the notes themselves are never changed.
  const importable = useMemo(() => {
    const copied = new Set(dates.map((date) => date.sourceNoteId).filter(Boolean));
    const pending = lists.filter(
      (list) =>
        list.theme === 'dates' &&
        !allNotes.some((note) => note.listId === list.id && copied.has(note.id))
    );
    return allNotes.filter((note) => pending.some((list) => list.id === note.listId));
  }, [allNotes, dates, lists]);

  const runImport = async () => {
    const targets = lists.filter((list) => importable.some((note) => note.listId === list.id));
    try {
      let added = 0;
      for (const list of targets) {
        const result = await importDates(list.id);
        added += result.added;
        setDates(result.dates);
      }
      showToast(added ? `${added} dates brought over` : 'nothing new to bring over');
    } catch (err) {
      handleError(err);
    }
  };

  const arrangeDates = (next: UsDate[], placed?: string) => {
    setDates(
      next.map((date, position) => ({
        ...date,
        position,
        numbered: date.id === placed ? true : date.numbered,
      }))
    );
    write(async () => setDates(await reorderDates(next.map((date) => date.id), placed)));
  };

  const pickView = (patch: Partial<Views>) => {
    setViews((current) => ({ ...current, ...patch }));
    write(() => saveViews(patch));
  };

  const pickMe = (author: Author) => {
    rememberMe(author);
    setMe(author);
  };

  // After a night is rated: the checklist starts fresh for the next date
  const resetRitual = async () => {
    const ritualIds = new Set(lists.filter((list) => list.theme === 'ritual').map((list) => list.id));
    const checked = allNotes.filter((note) => note.done && note.listId && ritualIds.has(note.listId));
    checked.forEach((note) => patchLocal(note.id, { done: false, doneAt: null }));
    await Promise.all(checked.map((note) => updateNote(note.id, { done: false })));
  };

  const saveRitualTo = async (date: UsDate, draft: RitualDraft) => {
    for (const author of ['karar', 'dania'] as Author[]) {
      if (hasScores(draft[author])) await saveDateRatings(date.id, author, draft[author]);
    }
    await resetRitual();
    setDates(await listDates());
    showToast(`saved to ${date.place}`);
  };

  const viewerDate = viewer ? dates.find((date) => date.id === viewer.dateId) ?? null : null;

  const setCaption = (index: number, caption: string) => {
    if (!viewerDate) return;
    const photos = viewerDate.photos.map((photo, i) =>
      i === index ? { url: photo.url, caption: caption.trim() || null } : { url: photo.url, caption: photo.caption }
    );
    setDates((current) =>
      current.map((date) => (date.id === viewerDate.id ? { ...date, photos } : date))
    );
    write(async () => {
      const updated = await saveDatePhotos(viewerDate.id, photos);
      setDates((current) => current.map((date) => (date.id === updated.id ? updated : date)));
    });
  };

  /* ---- render ---- */

  if (unlocked === null) {
    return (
      <div className="us-root">
        <BackgroundHearts />
        <div className="us-lock">
          <Heart size={34} fill="var(--accent)" className="us-beat" />
        </div>
      </div>
    );
  }

  if (!unlocked) return <LockScreen onUnlocked={() => setUnlocked(true)} />;

  const editorNumber = editor
    ? editor.date
      ? numbers.get(editor.date.id) ?? '؟'
      : nextNumber(dates)
    : '';

  return (
    <div className="us-root" data-theme={theme}>
      {theme === 'deck' && <BackgroundHearts />}

      <div className="us-shell us2-shell">
        <div className="us2-top">
          <header className="us-header">
            <button
              type="button"
              className="us-wordmark"
              title="change our names"
              onClick={() => setShowSettings(true)}
            >
              {names.nameOne}
              <Heart size={13} fill="var(--heart)" className="us-beat" />
              {names.nameTwo}
            </button>
          </header>

          <ListBar
            lists={lists}
            activeId={activeList?.id ?? null}
            counts={listCounts}
            onPick={chooseList}
            onNew={createList}
          />
        </div>

        {activeList && screen === 'arrange' && (
          <ArrangeView
            list={activeList}
            notes={notes}
            lists={lists}
            onReorderNotes={arrangeNotes}
            onReorderLists={arrangeLists}
            onTheme={setActiveTheme}
            onRename={renameActiveList}
            onRemove={lists.length > 1 ? removeActiveList : null}
            onDone={() => setScreen('list')}
          />
        )}

        {activeList && screen === 'list' && theme === 'deck' && (
          <DeckView
            list={activeList}
            notes={notes}
            actions={actions}
            onAdd={async (body, photoUrl) => {
              await add(body, photoUrl);
            }}
            onError={showToast}
            onSpin={() => setScreen('spin')}
            onArrange={() => setScreen('arrange')}
            onShowDone={() => setScreen('done')}
          />
        )}

        {activeList && screen === 'list' && theme === 'someday' && (
          <FutureView
            notes={notes}
            planTarget={deckList && deckList.id !== activeList.id ? deckList : null}
            actions={actions}
            onPlan={plan}
            onAdd={async (body, photoUrl) => {
              await add(body, photoUrl);
            }}
            onError={showToast}
          />
        )}

        {activeList && screen === 'list' && theme === 'places' && (
          <PlacesView
            notes={notes}
            dateList={deckList && deckList.id !== activeList.id ? deckList : null}
            actions={actions}
            onAdd={addPlace}
            onMove={movePin}
            onCopyToDates={copyToDates}
          />
        )}

        {activeList && screen === 'list' && theme === 'ritual' && me && (
          <RitualView
            notes={notes}
            me={me}
            dates={dates}
            actions={actions}
            onAdd={async (body) => {
              await add(body, null);
            }}
            onError={showToast}
            onSave={saveRitualTo}
            onNewDate={() => setEditor({ date: null, ritual: true })}
          />
        )}

        {activeList && screen === 'list' && theme === 'dates' && me && (
          <DatesView
            dates={dates}
            me={me}
            view={views.dateView ?? 'thread'}
            anniversary={settings?.anniversary ?? null}
            importCount={importable.length}
            onImport={runImport}
            onView={(dateView: DateView) => pickView({ dateView })}
            onEdit={(date, day) => setEditor({ date, ritual: false, day })}
            onPhotos={(date, index) => setViewer({ dateId: date.id, index })}
            onReorder={arrangeDates}
          />
        )}

        {screen !== 'list' && screen !== 'arrange' && (
          <div className="us2-backrow">
            <button type="button" className="us2-sublink strong" onClick={() => setScreen('list')}>
              ← back to {activeList?.name ?? 'the list'}
            </button>
          </div>
        )}

        {screen === 'spin' && (
          <>
            <div className="us-wheel-head">
              <h2>Can't decide?</h2>
              <p>
                {segments.length === 0
                  ? `nothing on ${activeList?.name ?? 'this list'} yet.`
                  : open.length === 0
                    ? 'everything here is hearted. add something new.'
                    : `let it choose from ${activeList?.name ?? 'the list'}`}
              </p>
            </div>

            {segments.length > 0 && (
              <Wheel
                segments={segments}
                onSpinStart={() => setResult(null)}
                onLanded={setResult}
              />
            )}

            {result && (
              <NotePanel
                note={notes.find((note) => note.id === result.id) ?? result}
                eyebrow="it chose"
                onToggleDone={toggleDone}
              />
            )}
          </>
        )}

        {screen === 'done' && (
          <>
            <div className="us-section">
              <h2>talked about</h2>
              <div className="us-progress">{doneNotes.length} of {notes.length}</div>
            </div>

            {doneNotes.length === 0 ? (
              <div className="us-empty">
                <Heart size={26} fill="var(--card-border-active)" />
                <p>nothing hearted yet.</p>
              </div>
            ) : (
              <div className="us-donelist">
                {doneNotes.map((note) => (
                  <div key={note.id} className="us-donerow">
                    <button
                      type="button"
                      className="us-heart-btn"
                      aria-label="undo"
                      onClick={() => toggleDone(note)}
                    >
                      <Heart size={20} fill="var(--accent)" />
                    </button>
                    <div>
                      <p dir="auto">{note.body}</p>
                      <small>
                        talked about{note.doneAt ? ` ${prettyDate(note.doneAt)}` : ''}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <footer className="us2-foot">
          <DayCounter settings={settings} onEdit={() => setShowSettings(true)} />
          <div className="us-panel-actions" style={{ justifyContent: 'center' }}>
            {me && (
              <button
                type="button"
                className="us-pill ghost"
                onClick={() => pickMe(me === 'karar' ? 'dania' : 'karar')}
              >
                this phone is {AUTHOR_NAME[me]} · switch
              </button>
            )}
            <button
              type="button"
              className="us-pill ghost"
              onClick={() => {
                setToken(null);
                setUnlocked(false);
              }}
            >
              lock it again
            </button>
          </div>
        </footer>
      </div>

      {needsMe && screen === 'list' && <WhoAreYou onPick={pickMe} />}

      {editor && me && (
        <DateEditor
          key={editor.date?.id ?? 'new'}
          date={editor.date}
          number={editorNumber}
          me={me}
          offerRitual={editor.ritual}
          initialDay={editor.day ?? null}
          onError={showToast}
          onClose={() => setEditor(null)}
          onDeleted={async () => {
            setEditor(null);
            setDates(await listDates());
          }}
          onSaved={async (usedRitual) => {
            setEditor(null);
            if (usedRitual) {
              saveRitual({ karar: { ...EMPTY_SCORES }, dania: { ...EMPTY_SCORES } });
              await resetRitual();
            }
            setDates(await listDates());
            showToast('kept ♥');
          }}
        />
      )}

      {viewer && viewerDate && (
        <PhotoViewer
          date={viewerDate}
          number={numbers.get(viewerDate.id) ?? '؟'}
          kind={views.photoViewer ?? 'stack'}
          startAt={Math.min(viewer.index, Math.max(0, viewerDate.photos.length - 1))}
          onKind={(photoViewer: PhotoViewerKind) => pickView({ photoViewer })}
          onCaption={setCaption}
          onClose={() => setViewer(null)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={async (next) => {
            try {
              setSettings(await saveSettings(next));
              setShowSettings(false);
            } catch (err) {
              handleError(err);
            }
          }}
        />
      )}

      {toast && <div className="us-toast">{toast}</div>}
    </div>
  );
}
