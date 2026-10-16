import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Heart } from '../icons';
import { Arrow, Segmented } from '../bits';
import { photoSrc, type DatePhoto, type PhotoViewer as Kind, type UsDate } from '../api';
import { dayLabel } from './shared';

const KINDS: Array<{ value: Kind; label: string }> = [
  { value: 'stack', label: 'stack' },
  { value: 'film', label: 'film' },
  { value: 'polaroids', label: 'polaroids' },
];

/**
 * A date's photos, full screen, in their saved order. Three ways to look at
 * them; the switch at the top is remembered for both phones.
 */
export default function PhotoViewer({
  date,
  number,
  kind,
  startAt = 0,
  onKind,
  onCaption,
  onClose,
}: {
  date: UsDate;
  number: string;
  kind: Kind;
  startAt?: number;
  onKind: (kind: Kind) => void;
  onCaption: (index: number, caption: string) => void;
  onClose: () => void;
}) {
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

  const photos = date.photos;
  const editCaption = (index: number) => {
    const next = window.prompt('a caption for this one', photos[index].caption ?? '');
    if (next !== null) onCaption(index, next);
  };

  return (
    <div className={`us2-viewer ${kind}`} role="dialog" aria-modal="true">
      <div className="us2-viewer-head">
        <button type="button" className="us2-round" aria-label="close" onClick={onClose}>
          <Arrow dir="left" />
        </button>
        <div className="us2-viewer-titles">
          <div className="us2-viewer-title" dir="rtl">
            {number}. {date.place}
          </div>
          <div className="us2-viewer-sub">
            {dayLabel(date.date)} · {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </div>
        </div>
      </div>
      <Segmented className="us2-viewer-switch" value={kind} options={KINDS} onChange={onKind} />

      {photos.length === 0 ? (
        <p className="us2-viewer-empty">no photos on this date yet.</p>
      ) : kind === 'stack' ? (
        <Stack photos={photos} startAt={startAt} />
      ) : kind === 'film' ? (
        <Film photos={photos} startAt={startAt} onCaption={editCaption} />
      ) : (
        <Polaroids photos={photos} />
      )}
    </div>
  );
}

const ROTATIONS = [0, -5, 6, -8, 9];

/** A pile of prints. Tap the top one and it shuffles to the back. */
function Stack({ photos, startAt }: { photos: DatePhoto[]; startAt: number }) {
  const [top, setTop] = useState(startAt);
  const n = photos.length;

  return (
    <>
      <div className="us2-stackview">
        {photos.map((photo, index) => {
          const pos = (index - top + n) % n;
          const visible = pos < 5;
          return (
            <button
              key={photo.url + index}
              type="button"
              className="us2-print"
              aria-label={pos === 0 ? 'next photo' : undefined}
              tabIndex={pos === 0 ? 0 : -1}
              onClick={() => setTop((top + 1) % n)}
              style={{
                zIndex: 10 - Math.min(pos, 9),
                opacity: visible ? 1 : 0,
                boxShadow: `0 ${16 - Math.min(pos, 4) * 3}px ${30 - Math.min(pos, 4) * 4}px rgba(74, 30, 48, ${(0.18 - Math.min(pos, 4) * 0.03).toFixed(2)})`,
                transform: `translateY(${Math.min(pos, 4) * 9}px) rotate(${ROTATIONS[Math.min(pos, 4)]}deg) scale(${(1 - Math.min(pos, 4) * 0.04).toFixed(2)})`,
              }}
            >
              <img src={photoSrc(photo.url)} alt={photo.caption ?? ''} draggable={false} />
              <span className="us2-print-foot">
                <span className="hd">{photo.caption || `photo ${index + 1}`}</span>
                <Heart size={18} fill="#d6396b" />
              </span>
            </button>
          );
        })}
      </div>
      <p className="us2-viewer-hint">tap the top photo to send it to the back</p>
      <div className="us2-pagedots">
        {photos.map((_, index) => (
          <span key={index} className={index === top ? 'on' : ''} />
        ))}
      </div>
    </>
  );
}

/** One big frame with a slow zoom, and a strip of film underneath to pick from */
function Film({
  photos,
  startAt,
  onCaption,
}: {
  photos: DatePhoto[];
  startAt: number;
  onCaption: (index: number) => void;
}) {
  const [i, setI] = useState(startAt);
  const n = photos.length;
  const current = photos[Math.min(i, n - 1)];
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    strip.current?.children[i]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [i]);

  return (
    <>
      <div className="us2-frame">
        <div className="us2-frame-photo">
          <img key={current.url} className="us2-kb" src={photoSrc(current.url)} alt={current.caption ?? ''} />
          <span className="us2-frame-count">
            {i + 1} / {n}
          </span>
        </div>
        <div className="us2-frame-foot">
          <button type="button" className="us2-caption hd" onClick={() => onCaption(i)}>
            {current.caption || 'add a caption…'}
          </button>
          <div className="us2-frame-arrows">
            <button type="button" className="us2-round" aria-label="previous" onClick={() => setI((i + n - 1) % n)}>
              <Arrow dir="left" />
            </button>
            <button type="button" className="us2-round filled" aria-label="next" onClick={() => setI((i + 1) % n)}>
              <Arrow dir="right" />
            </button>
          </div>
        </div>
      </div>
      <div className="us2-film">
        <div className="us2-sprockets" />
        <div className="us2-film-thumbs" ref={strip}>
          {photos.map((photo, index) => (
            <button
              key={photo.url + index}
              type="button"
              className={index === i ? 'on' : ''}
              aria-label={`photo ${index + 1}`}
              onClick={() => setI(index)}
              style={{ backgroundImage: `url("${photoSrc(photo.url)}")` }}
            />
          ))}
        </div>
        <div className="us2-sprockets" />
      </div>
      <p className="us2-viewer-hint">tap a frame on the strip</p>
    </>
  );
}

/** Scattered on the table. Tap one to pick it up, tap again to put it down. */
function Polaroids({ photos }: { photos: DatePhoto[] }) {
  const [lifted, setLifted] = useState(-1);
  const table = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(390);

  useLayoutEffect(() => {
    const element = table.current;
    if (!element) return;
    const measure = () => setWidth(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const card = Math.min(168, width * 0.43);
  // Two loose columns, each row a little higher or lower than the last
  const spots = photos.map((_, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const wobble = [-9, 7, -3, 6, -8, 4][index % 6];
    return {
      x: column === 0 ? width * 0.07 + (row % 2) * 18 : width - card - width * 0.07 - (row % 2) * 14,
      y: row * card * 0.98 + (column ? 0 : 14),
      r: wobble,
    };
  });
  const height = Math.max(card * 1.6, (Math.ceil(photos.length / 2) - 1) * card * 0.98 + card * 1.35);
  const scale = Math.min(1.55, (width * 0.86) / card);

  return (
    <>
      <div className="us2-table" ref={table} style={{ height }}>
        {photos.map((photo, index) => {
          const on = index === lifted;
          const spot = spots[index];
          return (
            <button
              key={photo.url + index}
              type="button"
              className={on ? 'us2-polaroid on' : 'us2-polaroid'}
              onClick={() => setLifted(on ? -1 : index)}
              style={{
                width: card,
                zIndex: on ? 40 : index,
                left: on ? (width - card) / 2 : spot.x,
                top: on ? Math.max(card * 0.3, (height - card * 1.2) / 2) : spot.y,
                transform: `rotate(${on ? 0 : spot.r}deg) scale(${on ? scale : 1})`,
              }}
            >
              <img src={photoSrc(photo.url)} alt={photo.caption ?? ''} draggable={false} />
              <span className="hd">{photo.caption || ' '}</span>
            </button>
          );
        })}
      </div>
      <p className="us2-viewer-hint">tap one to pick it up · tap again to put it down</p>
    </>
  );
}
