import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, FormEvent } from 'react';
import './us.css';
import { Heart, HeartOutline, ArrowUp, CameraIcon } from './icons';
import NoteSlider from './NoteSlider';
import NotePanel from './NotePanel';
import Wheel from './Wheel';
import { daysBetween, prettyDate, toDateInput } from './dates';
import {
  LockedError,
  addList,
  addNote,
  checkSession,
  deleteList,
  deleteNote,
  getSettings,
  getToken,
  listLists,
  listNotes,
  photoSrc,
  renameList,
  saveSettings,
  setToken,
  unlock,
  updateNote,
  uploadPhoto,
  type Note,
  type NoteList,
  type Settings,
} from './api';

type Screen = 'list' | 'spin' | 'done';

const POLL_MS = 7000;
const LIST_KEY = 'us:list';
const MAX_SEGMENTS = 6;
const DEFAULT_NAMES = { nameOne: 'karar', nameTwo: 'dania' };

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
          <HeartOutline />
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

function AddRow({
  onAdd,
  onError,
}: {
  onAdd: (body: string, photoUrl: string | null) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [body, setBody] = useState('');
  const [photo, setPhoto] = useState<{ url: string; preview: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadPhoto(file);
      setPhoto({ url, preview: url });
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd(body.trim(), photo?.url ?? null);
      setBody('');
      setPhoto(null);
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="us-add">
      <textarea
        placeholder="add a note to the list…"
        value={body}
        rows={2}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) submit();
        }}
      />
      <div className="us-add-row">
        {photo ? (
          <button type="button" className="us-chip on" onClick={() => setPhoto(null)}>
            <img className="us-thumb" src={photoSrc(photo.preview)} alt="" />
            remove
          </button>
        ) : (
          <button type="button" className="us-chip" onClick={() => fileRef.current?.click()}>
            <CameraIcon />
            photo
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={pickPhoto}
        />

        <button
          type="button"
          className="us-add-send"
          aria-label="add note"
          disabled={!body.trim() || busy}
          onClick={submit}
        >
          <ArrowUp />
        </button>
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

export default function UsPage() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [lists, setLists] = useState<NoteList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LIST_KEY);
    } catch {
      return null;
    }
  });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [screen, setScreen] = useState<Screen>('list');
  const [activeIndex, setActiveIndex] = useState(0);
  const [result, setResult] = useState<Note | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Keep this page out of search engines and off the site's usual title
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow, noarchive';
    document.head.appendChild(meta);

    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href =
      'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Quicksand:wght@400;500;600;700&display=swap';
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

  // While a write is in flight, let the optimistic state stand
  const writing = useRef(0);

  const refresh = useCallback(async () => {
    if (writing.current > 0) return;
    try {
      const [freshNotes, freshSettings, freshLists] = await Promise.all([
        listNotes(),
        getSettings(),
        listLists(),
      ]);
      setAllNotes(freshNotes);
      setSettings(freshSettings);
      setLists(freshLists);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

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

  // Everything below this line works on one list at a time
  const notes = useMemo(
    () => (activeList ? allNotes.filter((note) => note.listId === activeList.id) : []),
    [allNotes, activeList]
  );

  const listCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allNotes.forEach((note) => {
      if (note.listId && !note.done) counts[note.listId] = (counts[note.listId] ?? 0) + 1;
    });
    return counts;
  }, [allNotes]);

  const open = useMemo(() => notes.filter((note) => !note.done), [notes]);
  const doneNotes = useMemo(() => notes.filter((note) => note.done), [notes]);

  // Up to six segments: the ones still waiting first, then hearted ones to fill
  const segments = useMemo(() => {
    const waiting = [...open].reverse();
    return [...waiting, ...doneNotes].slice(0, MAX_SEGMENTS);
  }, [open, doneNotes]);

  useEffect(() => {
    if (activeIndex > notes.length - 1) setActiveIndex(Math.max(0, notes.length - 1));
  }, [notes.length, activeIndex]);

  const activeNote = notes[activeIndex] ?? null;
  const names = {
    nameOne: settings?.nameOne || DEFAULT_NAMES.nameOne,
    nameTwo: settings?.nameTwo || DEFAULT_NAMES.nameTwo,
  };

  const toggleDone = async (note: Note) => {
    const next = !note.done;
    // Optimistic — the heart should fill the instant it is tapped
    setAllNotes((current) =>
      current.map((item) =>
        item.id === note.id
          ? { ...item, done: next, doneAt: next ? new Date().toISOString() : null }
          : item
      )
    );
    setResult((current) => (current && current.id === note.id ? { ...current, done: next } : current));
    writing.current += 1;
    try {
      await updateNote(note.id, { done: next });
    } catch (err) {
      handleError(err);
      refresh();
    } finally {
      writing.current -= 1;
    }
  };

  const add = async (body: string, photoUrl: string | null) => {
    const note = await addNote({ body, photoUrl, listId: activeList?.id ?? null });
    setAllNotes((current) => [note, ...current]);
    setActiveIndex(0);
  };

  const chooseList = (id: string) => {
    setActiveListId(id);
    setActiveIndex(0);
    setResult(null);
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
      setScreen('list');
    } catch (err) {
      handleError(err);
    }
  };

  const renameActiveList = async () => {
    if (!activeList) return;
    const name = window.prompt('rename this list', activeList.name);
    if (name === null || !name.trim()) return;
    try {
      const updated = await renameList(activeList.id, name.trim());
      setLists((current) => current.map((list) => (list.id === updated.id ? updated : list)));
    } catch (err) {
      handleError(err);
    }
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

  return (
    <div className="us-root">
      <BackgroundHearts />

      <div className="us-shell">
        <header className="us-header">
          <button
            type="button"
            className="us-wordmark"
            title="change our names"
            onClick={() => setShowSettings(true)}
          >
            {names.nameOne}
            <Heart size={20} fill="var(--accent)" className="us-beat" />
            {names.nameTwo}
          </button>
          <nav className="us-nav">
            <button
              type="button"
              className={screen === 'list' ? 'on' : ''}
              onClick={() => setScreen('list')}
            >
              the list
            </button>
            <button
              type="button"
              className={screen === 'spin' ? 'on' : ''}
              onClick={() => setScreen('spin')}
            >
              spin it
            </button>
            <button
              type="button"
              className={screen === 'done' ? 'on' : ''}
              onClick={() => setScreen('done')}
            >
              done
              <span className="us-nav-badge">{doneNotes.length}</span>
            </button>
          </nav>
        </header>

        <ListBar
          lists={lists}
          activeId={activeList?.id ?? null}
          counts={listCounts}
          onPick={chooseList}
          onNew={createList}
        />

        <DayCounter settings={settings} onEdit={() => setShowSettings(true)} />

        {screen === 'list' && (
          <>
            <div className="us-section">
              <h2>{activeList?.name ?? 'our list'}</h2>
              <div className="us-progress">
                {open.length} to go · {doneNotes.length} talked about
                {activeList && (
                  <>
                    {' · '}
                    <button type="button" className="us-linkish" onClick={renameActiveList}>
                      rename
                    </button>
                    {lists.length > 1 && (
                      <>
                        {' · '}
                        <button type="button" className="us-linkish" onClick={removeActiveList}>
                          remove list
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {notes.length === 0 ? (
              <div className="us-empty">
                <Heart size={26} fill="var(--card-border-active)" />
                <p>nothing here yet. add the first one.</p>
              </div>
            ) : (
              <>
                <NoteSlider
                  notes={notes}
                  activeIndex={Math.min(activeIndex, notes.length - 1)}
                  onSelect={setActiveIndex}
                  onToggleDone={toggleDone}
                />
                {activeNote && (
                  <NotePanel
                    note={activeNote}
                    onToggleDone={toggleDone}
                    onDelete={remove}
                    onEditLabel={editLabel}
                  />
                )}
              </>
            )}

            <AddRow onAdd={add} onError={showToast} />

            <div className="us-panel-actions" style={{ justifyContent: 'center' }}>
              <button type="button" className="us-pill" onClick={() => setScreen('spin')}>
                <Heart size={13} fill="var(--accent)" />
                can't decide? spin it
              </button>
            </div>
          </>
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

            <div className="us-panel-actions" style={{ justifyContent: 'center' }}>
              <button type="button" className="us-pill ghost" onClick={() => setScreen('list')}>
                back to the list
              </button>
            </div>
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
                      <p>{note.body}</p>
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

        <div className="us-panel-actions" style={{ justifyContent: 'center', marginTop: 30 }}>
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
      </div>

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
