import { useEffect, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Heart } from '../icons';
import { LinkCard } from '../bits';
import NoteSheet, { type NoteActions } from '../NoteSheet';
import { addedTag } from '../dates';
import { findLink } from '../links';
import type { Note, NoteList } from '../api';

// Where pins go until someone moves them: spread out, off the river's edge
const SPOTS: Array<[number, number]> = [
  [0.51, 0.52], [0.21, 0.36], [0.82, 0.8], [0.74, 0.3], [0.3, 0.78],
  [0.6, 0.86], [0.12, 0.62], [0.88, 0.55], [0.42, 0.24], [0.62, 0.66],
];

function pinAt(note: Note, index: number): [number, number] {
  if (note.mapX !== null && note.mapY !== null) return [note.mapX, note.mapY];
  return SPOTS[index % SPOTS.length];
}

function placeName(note: Note): string {
  const link = findLink(note.body);
  return link ? link.caption || link.label : note.body;
}

/** The pin shape: a drop with a white dot, or dashed with a plus for "add" */
function Pin({ dashed = false, big = false }: { dashed?: boolean; big?: boolean }) {
  const size = big ? [34, 44] : [30, 40];
  return (
    <svg width={size[0]} height={size[1]} viewBox="0 0 34 44" aria-hidden="true">
      {dashed ? (
        <>
          <path
            d="M17 43C17 43 3 27 3 16.5a14 14 0 0128 0C31 27 17 43 17 43z"
            fill="#eef5f0"
            stroke="#8cb8aa"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          <path d="M17 11.5v10M12 16.5h10" stroke="#5d978a" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path
            d="M17 43C17 43 3 27 3 16.5a14 14 0 0128 0C31 27 17 43 17 43z"
            fill="#2f8a6f"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <circle cx="17" cy="16.5" r="5.2" fill="#ffffff" />
        </>
      )}
    </svg>
  );
}

/**
 * "Places✨": a hand-drawn map. Tap a pin for its postcard; "we went" stamps it
 * visited. The dashed pin adds a new place wherever you tap the map.
 */
export default function PlacesView({
  notes,
  dateList,
  actions,
  onAdd,
  onMove,
  onCopyToDates,
}: {
  notes: Note[];
  dateList: NoteList | null;
  actions: NoteActions;
  onAdd: (body: string, at: [number, number]) => Promise<void>;
  onMove: (note: Note, at: [number, number]) => void;
  onCopyToDates: (note: Note) => void;
}) {
  const [selected, setSelected] = useState<string | 'new' | null>(null);
  const [moving, setMoving] = useState(false);
  const [draftAt, setDraftAt] = useState<[number, number]>([0.21, 0.36]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState(false);

  // Open on the first place, or on "add" when there are none
  useEffect(() => {
    if (selected === null || (selected !== 'new' && !notes.some((note) => note.id === selected))) {
      setSelected(notes[0]?.id ?? 'new');
    }
  }, [notes, selected]);

  const current = notes.find((note) => note.id === selected) ?? null;
  const visited = notes.filter((note) => note.done).length;

  const tapMap = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (selected !== 'new' && !moving) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const at: [number, number] = [
      Math.min(0.97, Math.max(0.03, (event.clientX - rect.left) / rect.width)),
      Math.min(0.97, Math.max(0.1, (event.clientY - rect.top) / rect.height)),
    ];
    if (selected === 'new') setDraftAt(at);
    else if (current && moving) {
      onMove(current, at);
      setMoving(false);
    }
  };

  const pinIt = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd(draft.trim(), draftAt);
      setDraft('');
      setSelected(null);
    } finally {
      setBusy(false);
    }
  };

  const link = current ? findLink(current.body) : null;

  return (
    <div className="us2-places">
      <div className="us2-titlerow">
        <div>
          <h2 className="us2-title">places</h2>
          <div className="us2-sub">
            somewhere to go · {notes.length} pinned
          </div>
        </div>
        <span className="us2-counter">{visited} visited</span>
      </div>

      <div
        className={`us2-map${selected === 'new' || moving ? ' placing' : ''}`}
        onClick={tapMap}
      >
        <svg className="us2-map-art" viewBox="0 0 354 330" preserveAspectRatio="none" aria-hidden="true">
          <rect x="22" y="26" width="90" height="62" rx="14" fill="#d5e8dd" />
          <rect x="246" y="30" width="86" height="80" rx="14" fill="#d5e8dd" />
          <rect x="30" y="226" width="110" height="74" rx="14" fill="#d5e8dd" />
          <rect x="236" y="232" width="96" height="66" rx="14" fill="#d5e8dd" />
          <path d="M-10 150 C 60 110, 110 210, 180 170 S 300 90, 370 140" stroke="#a6d4c7" strokeWidth="34" fill="none" strokeLinecap="round" />
          <path d="M-10 150 C 60 110, 110 210, 180 170 S 300 90, 370 140" stroke="#8cc7b8" strokeWidth="2" fill="none" strokeDasharray="2 9" strokeLinecap="round" />
          <path d="M60 300 C 120 250, 210 280, 260 200" stroke="#ffffff" strokeWidth="3" fill="none" strokeDasharray="1 8" strokeLinecap="round" />
        </svg>
        <div className="us2-river-name" dir="rtl">
          دجلة
        </div>

        {notes.map((note, index) => {
          const [x, y] = pinAt(note, index);
          const on = note.id === selected;
          return (
            <button
              key={note.id}
              type="button"
              className={on ? 'us2-pin on' : 'us2-pin'}
              style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              aria-label={placeName(note)}
              onClick={(event) => {
                event.stopPropagation();
                setMoving(false);
                setSelected(note.id);
              }}
            >
              <Pin big />
              {note.done && <span className="us2-pin-heart"><Heart size={10} fill="#ffffff" /></span>}
            </button>
          );
        })}

        <button
          type="button"
          className={selected === 'new' ? 'us2-pin on' : 'us2-pin'}
          style={{ left: `${draftAt[0] * 100}%`, top: `${draftAt[1] * 100}%` }}
          aria-label="add a place"
          onClick={(event) => {
            event.stopPropagation();
            setMoving(false);
            setSelected('new');
          }}
        >
          <Pin dashed />
        </button>

        <div className="us2-map-label">
          {selected === 'new'
            ? 'tap the map to drop the new pin'
            : moving
              ? 'tap where it really is'
              : 'drawn map · tap a pin'}
        </div>
      </div>

      <div className="us2-postcard">
        <div className="us2-postcard-stampbox" aria-hidden="true">
          <Heart size={22} fill="#2f8a6f" />
        </div>

        {selected === 'new' || !current ? (
          <>
            <div className="us2-postcard-kicker">new place</div>
            <div className="us2-postcard-title" dir="rtl">
              وين نروح؟
            </div>
            <div className="us2-postcard-sub">
              Paste a Google Maps or Instagram link, or just write its name. Tap the map to drop it
              anywhere.
            </div>
            <textarea
              className="us2-postcard-input"
              dir="auto"
              rows={2}
              placeholder="a link, a name, or both…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="us2-postcard-actions">
              <button
                type="button"
                className="us2-visit on"
                disabled={!draft.trim() || busy}
                onClick={pinIt}
              >
                {busy ? 'pinning…' : 'pin it'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={current.done ? 'us2-visited on' : 'us2-visited'}>visited</div>
            <div className="us2-postcard-kicker">{addedTag(current.createdAt)}</div>
            <div className="us2-postcard-title" dir="auto">
              {placeName(current)}
            </div>
            {link && <div className="us2-postcard-sub">saved from {link.label === 'a link' ? 'a link' : `an ${link.label}`}</div>}
            {link && <LinkCard link={link} />}
            <div className="us2-postcard-actions">
              <button
                type="button"
                className={current.done ? 'us2-visit on' : 'us2-visit'}
                onClick={() => actions.onToggleDone(current)}
              >
                {current.done ? 'we went ✓' : 'we went'}
              </button>
              {dateList && (
                <button type="button" className="us2-visit soft" onClick={() => onCopyToDates(current)}>
                  add to a date
                </button>
              )}
              <button type="button" className="us2-visit soft" onClick={() => setMoving((m) => !m)}>
                {moving ? 'cancel' : 'move pin'}
              </button>
              <button type="button" className="us2-visit soft" onClick={() => setSheet(true)}>
                more
              </button>
            </div>
          </>
        )}
      </div>

      {sheet && current && (
        <NoteSheet
          note={current}
          actions={{
            ...actions,
            onDelete: (target) => {
              setSheet(false);
              actions.onDelete(target);
            },
          }}
          doneLabel={['we went', 'we went ✓']}
          onClose={() => setSheet(false)}
        />
      )}
    </div>
  );
}
