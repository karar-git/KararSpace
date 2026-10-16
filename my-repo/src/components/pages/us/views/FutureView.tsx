import { useState } from 'react';
import { Composer, PlayIcon } from '../bits';
import NoteSheet, { type NoteActions } from '../NoteSheet';
import { findLink } from '../links';
import type { Note, NoteList } from '../api';

const SHORT_MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const shortDate = (value: string) => {
  const date = new Date(value);
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
};

const STARS: Array<[number, number, number]> = [
  [30, 22, 2], [78, 58, 1.5], [128, 18, 2.5], [196, 44, 1.5], [252, 16, 2],
  [300, 64, 2.5], [348, 30, 1.5], [62, 96, 1.5], [214, 92, 2], [330, 104, 1.5],
];

const FIRST_GLANCE = 6;

/**
 * "for the future": wishes are cream tickets, saved reels are dark cards.
 * "plan it" moves a someday onto the date list.
 */
export default function FutureView({
  notes,
  planTarget,
  actions,
  onPlan,
  onAdd,
  onError,
}: {
  notes: Note[];
  planTarget: NoteList | null;
  actions: NoteActions;
  onPlan: (note: Note) => void;
  onAdd: (body: string, photoUrl: string | null) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [all, setAll] = useState(false);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const sheetNote = notes.find((note) => note.id === sheetId) ?? null;
  const shown = all ? notes : notes.slice(0, FIRST_GLANCE);
  const hidden = notes.length - shown.length;
  const hiddenReels = notes.slice(shown.length).filter((note) => findLink(note.body)).length;

  return (
    <div className="us2-future">
      <div className="us2-night">
        <svg className="us2-stars" viewBox="0 0 390 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {STARS.map(([cx, cy, r], index) => (
            <circle
              key={index}
              className="us2-twinkle"
              cx={cx}
              cy={cy}
              r={r}
              fill="#ffffff"
              style={{ animationDelay: `${(index * 0.37).toFixed(2)}s` }}
            />
          ))}
        </svg>
        <div className="us2-night-title">someday</div>
        <div className="us2-night-sub">
          {notes.length} {notes.length === 1 ? 'thing' : 'things'} we’ll do one day
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="us2-sub" style={{ textAlign: 'center', padding: '24px 0' }}>
          nothing saved for someday yet.
        </p>
      ) : (
        <div className="us2-tickets">
          {shown.map((note) => {
            const link = findLink(note.body);
            const dark = !!link;
            return (
              <div
                key={note.id}
                className={dark ? 'us2-ticket dark' : 'us2-ticket'}
                role="button"
                tabIndex={0}
                onClick={() => (link ? window.open(link.url, '_blank', 'noopener') : setSheetId(note.id))}
                onKeyDown={(event) => event.key === 'Enter' && setSheetId(note.id)}
              >
                <div className="us2-ticket-top">
                  {dark && (
                    <span className="us2-ticket-play">
                      <PlayIcon />
                    </span>
                  )}
                  <span className="us2-ticket-kind">{link ? link.label : 'a wish'}</span>
                </div>
                <div className="us2-ticket-text" dir="auto">
                  {link ? link.caption || (link.kind === 'video' ? 'a video we saved' : `a ${link.kind} we saved`) : note.body}
                </div>
                <div className="us2-ticket-foot">
                  <button
                    type="button"
                    className="us2-ticket-date"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSheetId(note.id);
                    }}
                  >
                    {shortDate(note.createdAt)} · more
                  </button>
                  {planTarget && (
                    <button
                      type="button"
                      className="us2-plan"
                      onClick={(event) => {
                        event.stopPropagation();
                        onPlan(note);
                      }}
                    >
                      plan it
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="us2-future-add">
        <Composer placeholder="add a someday…" onAdd={onAdd} onError={onError} />
        {hidden > 0 && (
          <button type="button" className="us2-more" onClick={() => setAll(true)}>
            +{hidden} {hiddenReels === hidden ? (hidden === 1 ? 'reel' : 'reels') : 'more'}
          </button>
        )}
      </div>

      {sheetNote && (
        <NoteSheet
          note={sheetNote}
          actions={{
            ...actions,
            onDelete: (target) => {
              setSheetId(null);
              actions.onDelete(target);
            },
          }}
          extra={
            planTarget && (
              <button
                type="button"
                className="us-pill"
                onClick={() => {
                  setSheetId(null);
                  onPlan(sheetNote);
                }}
              >
                plan it
              </button>
            )
          }
          onClose={() => setSheetId(null)}
        />
      )}
    </div>
  );
}
