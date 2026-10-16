import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Heart } from '../icons';
import { Arrow, Composer, LinkCard } from '../bits';
import NoteSheet, { type NoteActions } from '../NoteSheet';
import { addedTag } from '../dates';
import { findLink } from '../links';
import { photoSrc, type Note, type NoteList } from '../api';

/**
 * "the date list": one question at a time on a little stack of cards. The ones
 * still to talk about come first, in the order they were arranged.
 */
export default function DeckView({
  list,
  notes,
  actions,
  onAdd,
  onError,
  onSpin,
  onArrange,
  onShowDone,
}: {
  list: NoteList;
  notes: Note[];
  actions: NoteActions;
  onAdd: (body: string, photoUrl: string | null) => Promise<void>;
  onError: (message: string) => void;
  onSpin: () => void;
  onArrange: () => void;
  onShowDone: () => void;
}) {
  const deck = useMemo(
    () => [...notes.filter((note) => !note.done), ...notes.filter((note) => note.done)],
    [notes]
  );
  const open = deck.filter((note) => !note.done).length;
  const talked = deck.length - open;

  // Follow the note, not the index, so hearting one does not jump the deck
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  useEffect(() => setCurrentId(null), [list.id]);

  const index = Math.max(0, deck.findIndex((note) => note.id === currentId));
  const note = deck[index] ?? null;
  const go = (delta: number) => {
    if (!deck.length) return;
    setCurrentId(deck[(index + delta + deck.length) % deck.length].id);
  };

  // A sideways swipe on the card turns to the next one
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onDown = (event: ReactPointerEvent) => {
    swipe.current = { x: event.clientX, y: event.clientY };
  };
  const onUp = (event: ReactPointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(event.clientY - start.y)) go(dx < 0 ? 1 : -1);
  };

  const link = note ? findLink(note.body) : null;
  const progress = deck.length ? (talked / deck.length) * 100 : 0;

  return (
    <div className="us2-deck">
      <div className="us2-titlerow">
        <div>
          <h2 className="us2-title" dir="auto">
            {list.name}
          </h2>
          <div className="us2-sub">
            {open} to go ·{' '}
            <button type="button" className="us2-sublink" onClick={onShowDone}>
              {talked} talked about
            </button>
          </div>
        </div>
        <div className="us2-titleside">
          {deck.length > 0 && (
            <span className="us2-counter">
              {index + 1} / {deck.length}
            </span>
          )}
          <button type="button" className="us2-sublink strong" onClick={onArrange}>
            arrange
          </button>
        </div>
      </div>

      {note ? (
        <div className="us2-stack">
          <div className="us2-stack-back two" />
          <div className="us2-stack-back one" />
          <div
            className="us2-qcard"
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerCancel={() => (swipe.current = null)}
          >
            <div className="us2-qcard-top">
              <span className={note.done ? 'us2-status done' : 'us2-status'}>
                {note.done ? 'talked about' : 'up next'}
              </span>
              <button
                type="button"
                className="us2-qheart"
                aria-pressed={note.done}
                aria-label={note.done ? 'we talked about this' : 'mark as talked about'}
                onClick={() => {
                  // Hearting moves it to the back of the deck; stay on it
                  setCurrentId(note.id);
                  actions.onToggleDone(note);
                }}
              >
                <Heart
                  size={24}
                  fill={note.done ? 'var(--accent)' : 'none'}
                  stroke="var(--accent)"
                  strokeWidth={1.6}
                />
              </button>
            </div>

            <p className="us2-qtext" dir="auto">
              {link ? link.caption || link.label : note.body}
            </p>
            {link && <LinkCard link={link} />}
            {note.photoUrl && (
              <img className="us2-qphoto" src={photoSrc(note.photoUrl)} alt="" />
            )}

            <div className="us2-qcard-foot">
              <span>{addedTag(note.createdAt)}</span>
              <button type="button" className="us2-sublink" onClick={() => setSheet(true)}>
                more
              </button>
            </div>

            <div className={note.done ? 'us2-stamp on' : 'us2-stamp'} aria-hidden="true">
              <Heart size={16} fill="var(--accent)" />
              <span>
                talked
                <br />
                about
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="us-empty">
          <Heart size={26} fill="var(--card-border-active)" />
          <p>nothing here yet. add the first one.</p>
        </div>
      )}

      {deck.length > 0 && (
        <div className="us2-deck-controls">
          <button type="button" className="us2-round" aria-label="previous" onClick={() => go(-1)}>
            <Arrow dir="left" />
          </button>
          <button type="button" className="us2-next" onClick={() => go(1)}>
            next one <Arrow dir="right" />
          </button>
          <button type="button" className="us2-soft" onClick={onSpin}>
            spin
          </button>
        </div>
      )}

      <div className="us2-deck-bottom">
        {deck.length > 0 && (
          <div className="us2-bar" aria-hidden="true">
            <div style={{ width: `${progress}%` }} />
          </div>
        )}
        <Composer placeholder="add a question or a link…" onAdd={onAdd} onError={onError} />
      </div>

      {sheet && note && (
        <NoteSheet
          note={note}
          actions={{
            ...actions,
            onDelete: (target) => {
              setSheet(false);
              actions.onDelete(target);
            },
          }}
          doneLabel={['mark talked about', 'talked about']}
          onClose={() => setSheet(false)}
        />
      )}
    </div>
  );
}
