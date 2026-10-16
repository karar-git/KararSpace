import { useState } from 'react';
import { CheckIcon, Composer, HeartScore, Segmented, Sheet } from '../bits';
import NoteSheet, { type NoteActions } from '../NoteSheet';
import { noteText } from '../links';
import {
  AUTHOR_NAME,
  CATEGORIES,
  EMPTY_SCORES,
  average,
  hasScores,
  loadRitual,
  saveRitual,
  type RitualDraft,
} from '../people';
import { prettyDate } from '../dates';
import type { Author, Note, UsDate } from '../api';

/**
 * "date 🪞": the things we do every date, as a checklist, then each of us rates
 * the night. "save to our dates" puts the ratings on a date.
 */
export default function RitualView({
  notes,
  me,
  dates,
  actions,
  onAdd,
  onError,
  onSave,
  onNewDate,
}: {
  notes: Note[];
  me: Author;
  dates: UsDate[];
  actions: NoteActions;
  onAdd: (body: string, photoUrl: string | null) => Promise<void>;
  onError: (message: string) => void;
  /** Saves tonight's ratings to a date and clears the checklist */
  onSave: (target: UsDate, draft: RitualDraft) => Promise<void>;
  /** Opens "a new date" with tonight's ratings ready to attach */
  onNewDate: () => void;
}) {
  const [who, setWho] = useState<Author>(me);
  const [draft, setDraft] = useState<RitualDraft>(loadRitual);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const sheetNote = notes.find((note) => note.id === sheetId) ?? null;

  const done = notes.filter((note) => note.done).length;
  const all = [...Object.values(draft.karar), ...Object.values(draft.dania)];
  const avg = average(all);
  const anything = hasScores(draft.karar) || hasScores(draft.dania);

  const rate = (category: keyof typeof EMPTY_SCORES, score: number) => {
    const next = { ...draft, [who]: { ...draft[who], [category]: score } };
    setDraft(next);
    saveRitual(next);
  };

  const save = async (target: UsDate) => {
    setBusy(true);
    try {
      await onSave(target, draft);
      const cleared = { karar: { ...EMPTY_SCORES }, dania: { ...EMPTY_SCORES } };
      setDraft(cleared);
      saveRitual(cleared);
      setPicking(false);
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="us2-ritual">
      <div className="us2-titlerow">
        <div>
          <h2 className="us2-title">every date, same ritual</h2>
          <div className="us2-sub">
            {notes.length === 3 ? 'three things' : `${notes.length} things`} before we go home · {done} of{' '}
            {notes.length} done
          </div>
        </div>
      </div>

      <div className="us2-checks">
        {notes.map((note) => (
          <div key={note.id} className={note.done ? 'us2-check on' : 'us2-check'}>
            <button
              type="button"
              className="us2-check-main"
              aria-pressed={note.done}
              onClick={() => actions.onToggleDone(note)}
            >
              <span className="us2-check-box">
                <CheckIcon />
              </span>
              <span className="us2-check-text" dir="auto">
                {noteText(note.body)}
              </span>
            </button>
            <button
              type="button"
              className="us2-check-more"
              aria-label="more"
              onClick={() => setSheetId(note.id)}
            >
              ···
            </button>
          </div>
        ))}
        <Composer placeholder="add one more thing…" onAdd={onAdd} onError={onError} allowPhoto={false} />
      </div>

      <div className="us2-rate">
        <div className="us2-rate-head">
          <div>
            <div className="us2-rate-title">rate tonight</div>
            <div className="us2-rate-avg">
              {avg ? `tonight so far · ${avg.toFixed(1)} / 5` : 'not rated yet'}
            </div>
          </div>
          <Segmented<Author>
            className="peach"
            value={who}
            options={[
              { value: 'karar', label: AUTHOR_NAME.karar },
              { value: 'dania', label: AUTHOR_NAME.dania },
            ]}
            onChange={setWho}
          />
        </div>
        {CATEGORIES.map((category) => (
          <div key={category.key} className="us2-rate-row">
            <span dir="auto">{category.label}</span>
            <HeartScore
              value={draft[who][category.key]}
              onChange={(score) => rate(category.key, score)}
              color="var(--accent)"
            />
          </div>
        ))}
      </div>

      <div className="us2-ritual-save">
        <button
          type="button"
          className="us2-big"
          disabled={!anything || busy}
          onClick={() => setPicking(true)}
        >
          save to our dates 🦢
        </button>
        <p>Ratings land on that date’s memory page.</p>
      </div>

      {picking && (
        <Sheet onClose={() => setPicking(false)}>
          <div className="us-eyebrow">which date was tonight?</div>
          <div className="us2-pick-dates">
            <button type="button" className="us2-pick-date new" disabled={busy} onClick={() => {
                setPicking(false);
                onNewDate();
              }}>
              a new date
            </button>
            {dates.slice(0, 8).map((date) => (
              <button
                key={date.id}
                type="button"
                className="us2-pick-date"
                disabled={busy}
                onClick={() => save(date)}
              >
                <span dir="auto">{date.place}</span>
                <small>{date.date ? prettyDate(date.date) : 'no date'}</small>
              </button>
            ))}
          </div>
        </Sheet>
      )}

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
          onClose={() => setSheetId(null)}
        />
      )}
    </div>
  );
}
