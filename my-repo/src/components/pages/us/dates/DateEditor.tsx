import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Heart } from '../icons';
import { CheckIcon, CloseIcon, HeartScore, PlusIcon, Segmented } from '../bits';
import { useGridReorder } from '../useReorder';
import {
  AUTHOR_COLOR,
  AUTHOR_NAME,
  CATEGORIES,
  EMPTY_SCORES,
  NOTE_PROMPT,
  average,
  hasScores,
  loadRitual,
  other,
  scoresFor,
} from '../people';
import {
  addDate,
  deleteDate,
  photoSrc,
  saveDateNote,
  saveDatePhotos,
  saveDateRatings,
  updateDate,
  uploadPhoto,
  type Author,
  type DatePhoto,
  type Scores,
  type UsDate,
} from '../api';
import { fromInput, toInput } from './shared';

const MAX_PHOTOS = 30;

/**
 * Where, when, photos in order, and a note from each of us. The same form adds
 * a new date and edits an old one.
 */
export default function DateEditor({
  date,
  number,
  me,
  offerRitual,
  initialDay,
  onSaved,
  onDeleted,
  onClose,
  onError,
}: {
  date: UsDate | null;
  number: string;
  me: Author;
  /** Opened from the ritual: attach tonight's ratings by default */
  offerRitual: boolean;
  initialDay?: string | null;
  onSaved: (usedRitual: boolean) => void;
  onDeleted: () => void;
  onClose: () => void;
  onError: (message: string) => void;
}) {
  const [place, setPlace] = useState(date?.place ?? '');
  const [day, setDay] = useState(toInput(date?.date ?? initialDay ?? null));
  const [photos, setPhotos] = useState<DatePhoto[]>(() =>
    (date?.photos ?? []).map((photo) => ({ url: photo.url, caption: photo.caption }))
  );
  const [who, setWho] = useState<Author>(me);
  const saved = useMemo(() => {
    const byAuthor = (author: Author) => date?.notes.find((note) => note.author === author)?.body ?? '';
    return { karar: byAuthor('karar'), dania: byAuthor('dania') };
  }, [date]);
  const [notes, setNotes] = useState<Record<Author, string>>(saved);
  const savedScores = useMemo(
    () => ({
      karar: date ? scoresFor(date, 'karar') : { ...EMPTY_SCORES },
      dania: date ? scoresFor(date, 'dania') : { ...EMPTY_SCORES },
    }),
    [date]
  );
  const [scores, setScores] = useState<Record<Author, Scores>>(savedScores);
  const ritual = useMemo(loadRitual, []);
  const ritualReady = hasScores(ritual.karar) || hasScores(ritual.dania);
  const [useRitual, setUseRitual] = useState(offerRitual && ritualReady);
  const [uploading, setUploading] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const grid = useGridReorder(photos, setPhotos);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  // Each of us writes our own. The other one's note opens once yours is saved.
  const theirs = other(me);
  const hiddenFromMe = who === theirs && !!saved[theirs] && !saved[me];

  const addPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS - photos.length);
    event.target.value = '';
    for (const file of files) {
      setUploading((count) => count + 1);
      try {
        const url = await uploadPhoto(file);
        setPhotos((current) => [...current, { url, caption: null }]);
      } catch (err) {
        onError((err as Error).message);
      } finally {
        setUploading((count) => count - 1);
      }
    }
  };

  const save = async () => {
    if (!place.trim() || busy || uploading) return;
    setBusy(true);
    try {
      const when = fromInput(day);
      let id = date?.id;
      if (!id) {
        id = (await addDate({ place: place.trim(), date: when })).id;
      } else if (place.trim() !== date?.place || when !== (date?.date ?? null)) {
        await updateDate(id, { place: place.trim(), date: when });
      }

      const before = (date?.photos ?? []).map((photo) => `${photo.url}|${photo.caption ?? ''}`).join(',');
      const after = photos.map((photo) => `${photo.url}|${photo.caption ?? ''}`).join(',');
      if (before !== after) await saveDatePhotos(id, photos);

      for (const author of ['karar', 'dania'] as Author[]) {
        if (notes[author].trim() !== saved[author]) await saveDateNote(id, author, notes[author]);
      }

      for (const author of ['karar', 'dania'] as Author[]) {
        // Tonight's ritual hearts fill in whatever was not rated here
        const merged = { ...scores[author] };
        if (useRitual) {
          for (const { key } of CATEGORIES) {
            if (!merged[key] && ritual[author][key]) merged[key] = ritual[author][key];
          }
        }
        const changed = CATEGORIES.some(({ key }) => merged[key] !== savedScores[author][key]);
        if (changed) await saveDateRatings(id, author, merged);
      }

      onSaved(useRitual);
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!date) return;
    if (!window.confirm(`remove the date at ${date.place}? its photos and notes go with it.`)) return;
    try {
      await deleteDate(date.id);
      onDeleted();
    } catch (err) {
      onError((err as Error).message);
    }
  };

  const ritualAvg = average([...Object.values(ritual.karar), ...Object.values(ritual.dania)]);

  return (
    <div className="us2-editor" role="dialog" aria-modal="true">
      <div className="us2-editor-inner">
        <div className="us2-editor-head">
          <button type="button" className="us2-round" aria-label="close" onClick={onClose}>
            <CloseIcon />
          </button>
          <div className="us2-editor-title">{date ? 'our date' : 'a new date'}</div>
          <span style={{ width: 44 }} />
        </div>

        <label className="us2-field">
          <span>where</span>
          <input
            className="us2-input ar big"
            dir="auto"
            value={place}
            maxLength={120}
            placeholder="وين رحنا؟"
            onChange={(event) => setPlace(event.target.value)}
          />
        </label>

        <div className="us2-field-pair">
          <label className="us2-field">
            <span>when</span>
            <input
              className="us2-input"
              type="date"
              value={day}
              onChange={(event) => setDay(event.target.value)}
            />
          </label>
          <div className="us2-field">
            <span>number</span>
            <div className="us2-input ar num">{number}</div>
          </div>
        </div>

        <div className="us2-field">
          <div className="us2-field-head">
            <span>photos</span>
            <b>
              {uploading ? `adding ${uploading}…` : `${photos.length} added`}
            </b>
          </div>
          <div className="us2-photo-grid" ref={grid.containerRef}>
            {photos.map((photo, index) => (
              <div
                key={photo.url}
                data-tile
                className="us2-photo-tile"
                onPointerDown={grid.start(index)}
                style={{ backgroundImage: `url("${photoSrc(photo.url)}")`, ...grid.tileStyle(photo) }}
              >
                {index === 0 && <span className="us2-cover">cover</span>}
                <button
                  type="button"
                  className="us2-tile-x"
                  aria-label="take this photo off"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setPhotos((current) => current.filter((item) => item !== photo))}
                >
                  <CloseIcon size={11} />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button type="button" className="us2-photo-add" onClick={() => fileRef.current?.click()}>
                <PlusIcon size={18} />
                add
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
          <p className="us2-field-hint">Drag photos to change their order. The first one is the cover.</p>
        </div>

        <div className="us2-field">
          <div className="us2-field-head">
            <span>a note from</span>
            <Segmented<Author>
              value={who}
              options={[
                { value: 'karar', label: AUTHOR_NAME.karar, color: AUTHOR_COLOR.karar },
                { value: 'dania', label: AUTHOR_NAME.dania, color: AUTHOR_COLOR.dania },
              ]}
              onChange={setWho}
            />
          </div>
          {hiddenFromMe ? (
            <div className="us2-lined us2-sealed">
              <Heart size={18} fill={AUTHOR_COLOR[theirs]} />
              {AUTHOR_NAME[theirs]} already wrote {theirs === 'dania' ? 'hers' : 'his'}. Save yours to
              read it.
            </div>
          ) : (
            <textarea
              className="us2-lined hd"
              dir="auto"
              rows={4}
              value={notes[who]}
              placeholder={NOTE_PROMPT[who]}
              onChange={(event) => setNotes({ ...notes, [who]: event.target.value })}
            />
          )}
          <p className="us2-field-hint">
            {who === me
              ? `${AUTHOR_NAME[theirs]} writes ${theirs === 'dania' ? 'her' : 'his'} own. You see ${theirs === 'dania' ? 'hers' : 'his'} once you save yours.`
              : `This is ${AUTHOR_NAME[who]}’s side.`}
          </p>
        </div>

        <div className="us2-field">
          <div className="us2-field-head">
            <span>{AUTHOR_NAME[who]} rates it</span>
          </div>
          {CATEGORIES.map((category) => (
            <div key={category.key} className="us2-rate-row">
              <span dir="auto">{category.label}</span>
              <HeartScore
                value={scores[who][category.key]}
                color={AUTHOR_COLOR[who]}
                onChange={(score) =>
                  setScores({ ...scores, [who]: { ...scores[who], [category.key]: score } })
                }
              />
            </div>
          ))}
        </div>

        {ritualReady && (
          <button
            type="button"
            className={useRitual ? 'us2-ritual-pick on' : 'us2-ritual-pick'}
            aria-pressed={useRitual}
            onClick={() => setUseRitual(!useRitual)}
          >
            <span className="us2-ritual-box">
              <CheckIcon />
            </span>
            <span>
              <b>use tonight’s ritual ratings</b>
              <small>from date 🪞 · {ritualAvg.toFixed(1)} / 5</small>
            </span>
          </button>
        )}

        <button
          type="button"
          className="us2-big"
          disabled={!place.trim() || busy || uploading > 0}
          onClick={save}
        >
          <Heart size={16} fill="#ffffff" />
          {busy ? 'keeping it…' : 'keep this date'}
        </button>
        {date && (
          <button type="button" className="us-linkish us2-editor-remove" onClick={remove}>
            remove this date
          </button>
        )}
      </div>
    </div>
  );
}
