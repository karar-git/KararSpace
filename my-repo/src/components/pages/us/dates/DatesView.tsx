import { useCallback, useMemo, useState } from 'react';
import { Heart } from '../icons';
import { Arrow, Grip, HeartScore, PlusIcon, Segmented } from '../bits';
import { moveItem, useVerticalReorder } from '../useReorder';
import { AUTHOR_COLOR, AUTHOR_NAME, NOTE_PROMPT, dateAverage, other } from '../people';
import type { Author, DateView, UsDate } from '../api';
import { MONTH_NAMES, dateNumbers, dayLabel, dayParts, photoBg } from './shared';

const VIEWS: Array<{ value: DateView; label: string }> = [
  { value: 'thread', label: 'thread' },
  { value: 'book', label: 'book' },
  { value: 'calendar', label: 'calendar' },
];

interface Props {
  dates: UsDate[];
  me: Author;
  view: DateView;
  anniversary: string | null;
  importCount: number;
  onImport: () => void;
  onView: (view: DateView) => void;
  onEdit: (date: UsDate | null, day?: string) => void;
  onPhotos: (date: UsDate, index: number) => void;
  onReorder: (next: UsDate[], placed?: string) => void;
}

/** "our dates 🦢": each date gets a home, shown three ways */
export default function DatesView(props: Props) {
  const { dates, view, importCount, onImport, onView, onEdit } = props;
  const numbers = useMemo(() => dateNumbers(dates), [dates]);

  return (
    <div className="us2-dates">
      <div className="us2-titlerow">
        <div>
          <h2 className="us2-title">our dates</h2>
          <div className="us2-sub">
            {view === 'thread'
              ? 'Drag the dots to reorder. The numbers follow.'
              : view === 'book'
                ? 'One date per page. Turn with the arrows.'
                : 'Days we went out light up.'}
          </div>
        </div>
        <button type="button" className="us2-done-btn" onClick={() => onEdit(null)}>
          <PlusIcon size={13} color="#ffffff" /> date
        </button>
      </div>

      <Segmented className="us2-viewswitch" value={view} options={VIEWS} onChange={onView} />

      {importCount > 0 && (
        <div className="us2-import">
          <p>
            {dates.length
              ? `${importCount} notes on the old list are not here yet.`
              : `Your ${importCount} notes from “our dates 🦢” can become real dates.`}{' '}
            The notes themselves stay where they are.
          </p>
          <button type="button" className="us2-done-btn" onClick={onImport}>
            bring them over
          </button>
        </div>
      )}

      {dates.length === 0 && importCount === 0 ? (
        <div className="us-empty">
          <Heart size={26} fill="var(--card-border-active)" />
          <p>no dates yet. add the first one.</p>
        </div>
      ) : view === 'thread' ? (
        <Thread {...props} numbers={numbers} />
      ) : view === 'book' ? (
        <Book {...props} numbers={numbers} />
      ) : (
        <Calendar {...props} numbers={numbers} />
      )}
    </div>
  );
}

/** What one of us wrote, unless the other has not written theirs yet */
function NoteSide({ date, author, me, onClick, big = false }: {
  date: UsDate;
  author: Author;
  me: Author;
  onClick: () => void;
  big?: boolean;
}) {
  const body = date.notes.find((note) => note.author === author)?.body;
  const mine = date.notes.some((note) => note.author === me);
  const sealed = author === other(me) && !!body && !mine;

  return (
    <button type="button" className={big ? 'us2-noteside big' : 'us2-noteside'} onClick={onClick}>
      <span className="us2-noteside-from" style={{ color: AUTHOR_COLOR[author] }}>
        from {AUTHOR_NAME[author]}
      </span>
      <span className={body && !sealed ? 'hd written' : 'hd'} dir="auto">
        {sealed ? 'wrote something · write yours to read it' : body || NOTE_PROMPT[author]}
      </span>
    </button>
  );
}

function ratingLine(date: UsDate): string {
  const avg = dateAverage(date);
  return avg ? `♥ ${avg.toFixed(1)}` : 'rate it';
}

/* ---- the thread ------------------------------------------------------ */

function Thread({
  dates,
  me,
  numbers,
  onEdit,
  onPhotos,
  onReorder,
}: Props & { numbers: Map<string, string> }) {
  const [openId, setOpenId] = useState<string | null>(dates[0]?.id ?? null);
  const drop = useCallback(
    (from: number, to: number) => {
      const moved = dates[from];
      onReorder(moveItem(dates, from, to), moved.numbered ? undefined : moved.id);
    },
    [dates, onReorder]
  );
  const rows = useVerticalReorder(drop);

  return (
    <div className="us2-thread" ref={rows.containerRef}>
      <div className="us2-thread-line" aria-hidden="true" />
      {dates.map((date, index) => {
        const on = date.id === openId && rows.liftedIndex === null;
        const lifted = rows.liftedIndex === index;
        const unknown = !date.numbered;
        return (
          <div key={date.id} data-row className="us2-node" style={rows.rowStyle(index)}>
            <div className={`us2-node-dot${on || lifted ? ' on' : ''}${unknown ? ' unknown' : ''}`}>
              {numbers.get(date.id)}
            </div>
            <div
              className={`us2-node-card${on ? ' on' : ''}${lifted ? ' lifted' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (rows.wasDrag()) return;
                setOpenId(on ? null : date.id);
              }}
              onKeyDown={(event) => event.key === 'Enter' && setOpenId(on ? null : date.id)}
            >
              <div className="us2-node-top">
                <span className={unknown ? 'us2-node-date unknown' : 'us2-node-date'}>
                  {unknown ? 'which one was it? drag it into place' : dayLabel(date.date)}
                </span>
                <span className="us2-node-rating">{ratingLine(date)}</span>
              </div>
              <div className="us2-node-place" dir="auto">
                {date.place}
              </div>
              {on && (
                <>
                  <div className="us2-node-thumbs">
                    {date.photos.slice(0, 3).map((photo, i) => (
                      <button
                        key={photo.url}
                        type="button"
                        className="us2-thumb"
                        aria-label={`photo ${i + 1}`}
                        style={photoBg(photo.url, i)}
                        onClick={(event) => {
                          event.stopPropagation();
                          onPhotos(date, i);
                        }}
                      />
                    ))}
                    {date.photos.length > 3 && (
                      <button
                        type="button"
                        className="us2-thumb more"
                        onClick={(event) => {
                          event.stopPropagation();
                          onPhotos(date, 3);
                        }}
                      >
                        +{date.photos.length - 3}
                      </button>
                    )}
                    <button
                      type="button"
                      className="us2-thumb add"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(date);
                      }}
                    >
                      + photos
                    </button>
                  </div>
                  <div className="us2-node-notes" onClick={(event) => event.stopPropagation()}>
                    <NoteSide date={date} author="karar" me={me} onClick={() => onEdit(date)} />
                    <NoteSide date={date} author="dania" me={me} onClick={() => onEdit(date)} />
                  </div>
                  <button
                    type="button"
                    className="us2-sublink strong"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(date);
                    }}
                  >
                    edit this date
                  </button>
                </>
              )}
            </div>
            <Grip onPointerDown={rows.start(index)} label="drag to reorder" />
          </div>
        );
      })}
    </div>
  );
}

/* ---- the memory book ---------------------------------------------------- */

function Book({ dates, me, numbers, onEdit, onPhotos }: Props & { numbers: Map<string, string> }) {
  // Oldest first, like a book: the thread is newest on top
  const pages = useMemo(() => [...dates].reverse(), [dates]);
  const [p, setP] = useState(0);
  const page = Math.min(p, pages.length - 1);
  const date = pages[page];
  if (!date) return null;

  const cover = date.photos[0]?.url;
  const avg = Math.round(dateAverage(date));
  const turn = (delta: number) => setP((page + delta + pages.length) % pages.length);

  return (
    <div className="us2-book">
      <div className="us2-page">
        <button
          type="button"
          className="us2-page-photo"
          onClick={() => (cover ? onPhotos(date, 0) : onEdit(date))}
        >
          <span className="us2-kb us2-page-img" style={photoBg(cover, page + 1)} />
          <span className="us2-page-shade" />
          <span className="us2-page-num ar">{numbers.get(date.id)}</span>
          <span className="us2-page-count">
            {date.photos.length} {date.photos.length === 1 ? 'photo' : 'photos'}
          </span>
          {!cover && <span className="us2-page-hint">add a photo</span>}
        </button>
        <div className="us2-page-meta">
          <span>{dayLabel(date.date)}</span>
          <HeartScore value={avg} size={15} />
        </div>
        <div className="us2-page-place" dir="auto">
          {date.place}
        </div>
        <div className="us2-page-notes">
          <NoteSide date={date} author="karar" me={me} big onClick={() => onEdit(date)} />
          <NoteSide date={date} author="dania" me={me} big onClick={() => onEdit(date)} />
        </div>
        <span className="us2-page-corner" aria-hidden="true" />
      </div>

      <div className="us2-book-nav">
        <button type="button" className="us2-round" aria-label="previous page" onClick={() => turn(-1)}>
          <Arrow dir="left" />
        </button>
        <div className="us2-book-where">
          <div className="us2-pagedots">
            {pages.map((item, index) => (
              <span key={item.id} className={index === page ? 'on' : ''} />
            ))}
          </div>
          <span>
            date {numbers.get(date.id)} of {numbers.get(dates.find((d) => d.numbered)?.id ?? '') ?? '٠'}
          </span>
        </div>
        <button type="button" className="us2-round filled" aria-label="next page" onClick={() => turn(1)}>
          <Arrow dir="right" />
        </button>
      </div>
    </div>
  );
}

/* ---- the calendar --------------------------------------------------------- */

const WEEKDAYS = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];

function Calendar({
  dates,
  numbers,
  anniversary,
  onEdit,
  onPhotos,
}: Props & { numbers: Map<string, string> }) {
  // Every month from the one it started in up to now, or the latest date
  const months = useMemo(() => {
    const today = new Date();
    const start = anniversary ? dayParts(anniversary) : { year: today.getFullYear(), month: today.getMonth() };
    let end = { year: today.getFullYear(), month: today.getMonth() };
    dates.forEach((date) => {
      if (!date.date) return;
      const { year, month } = dayParts(date.date);
      if (year * 12 + month > end.year * 12 + end.month) end = { year, month };
    });
    const list: Array<{ year: number; month: number }> = [];
    for (let k = start.year * 12 + start.month; k <= end.year * 12 + end.month && list.length < 60; k += 1) {
      list.push({ year: Math.floor(k / 12), month: k % 12 });
    }
    return list.length ? list : [end];
  }, [dates, anniversary]);

  // Open on the latest month we went out in
  const [m, setM] = useState(() => {
    let latest = months.length - 1;
    while (
      latest > 0 &&
      !dates.some((date) => {
        if (!date.date) return false;
        const { year, month } = dayParts(date.date);
        return year === months[latest].year && month === months[latest].month;
      })
    ) {
      latest -= 1;
    }
    return dates.some((date) => date.date) ? latest : months.length - 1;
  });
  const month = months[Math.min(m, months.length - 1)];
  const [sel, setSel] = useState<number | null>(null);

  const marks = new Map<number, UsDate>();
  dates.forEach((date) => {
    if (!date.date) return;
    const parts = dayParts(date.date);
    if (parts.year === month.year && parts.month === month.month && !marks.has(parts.day)) {
      marks.set(parts.day, date);
    }
  });
  const one = anniversary ? dayParts(anniversary) : null;
  const dayOne = one && one.year === month.year && one.month === month.month ? one.day : null;

  const first = new Date(month.year, month.month, 1).getDay();
  const offset = (first + 1) % 7; // weeks start on Saturday
  const daysIn = new Date(month.year, month.month + 1, 0).getDate();
  const picked = sel !== null ? marks.get(sel) : undefined;
  const pickedOne = sel !== null && sel === dayOne && !picked;

  return (
    <div className="us2-cal">
      <div className="us2-cal-head">
        <div className="us2-cal-month">
          {MONTH_NAMES[month.month][0].toUpperCase() + MONTH_NAMES[month.month].slice(1)}{' '}
          <em>{month.year}</em>
        </div>
        <span className="us2-counter">
          {dayOne ? 'day one ♥' : marks.size === 1 ? '1 date' : `${marks.size} dates`}
        </span>
      </div>

      <div className="us2-cal-months">
        {months.map((item, index) => (
          <button
            key={`${item.year}-${item.month}`}
            type="button"
            className={index === m ? 'on' : ''}
            onClick={() => {
              setM(index);
              setSel(null);
            }}
          >
            {MONTH_NAMES[item.month].slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="us2-cal-grid-wrap">
        <div className="us2-cal-grid names">
          {WEEKDAYS.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
        <div className="us2-cal-grid">
          {Array.from({ length: offset }, (_, k) => (
            <span key={`b${k}`} />
          ))}
          {Array.from({ length: daysIn }, (_, k) => {
            const day = k + 1;
            const date = marks.get(day);
            const isOne = day === dayOne;
            const on = sel === day;
            if (!date && !isOne) {
              return (
                <span key={day} className="us2-cal-day">
                  {day}
                </span>
              );
            }
            return (
              <button
                key={day}
                type="button"
                className={`us2-cal-day${date ? ' lit' : ' one'}${on ? ' on' : ''}`}
                style={date ? photoBg(date.photos[0]?.url, dates.indexOf(date) + 1) : undefined}
                onClick={() => setSel(on ? null : day)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className={picked || pickedOne ? 'us2-cal-sheet' : 'us2-cal-sheet dim'}>
        <div className="us2-sheet-handle" />
        <div className="us2-cal-sheet-top">
          <span>
            {picked
              ? dayLabel(picked.date)
              : pickedOne
                ? `${sel} ${MONTH_NAMES[month.month]} ${month.year}`
                : 'tap a day with a photo'}
          </span>
          <b>{picked ? `date ${numbers.get(picked.id)}` : pickedOne ? 'day one' : ''}</b>
        </div>
        {picked && (
          <>
            <div className="us2-cal-place" dir="auto">
              {picked.place}
            </div>
            {picked.photos.length > 0 && (
              <div className="us2-cal-thumbs">
                {picked.photos.slice(0, 4).map((photo, i) => (
                  <button
                    key={photo.url}
                    type="button"
                    className="us2-thumb big"
                    aria-label={`photo ${i + 1}`}
                    style={photoBg(photo.url, i)}
                    onClick={() => onPhotos(picked, i)}
                  />
                ))}
              </div>
            )}
            <button type="button" className="us2-big small" onClick={() => onEdit(picked)}>
              open this memory
            </button>
          </>
        )}
        {pickedOne && (
          <div className="us2-cal-place" dir="rtl">
            اليوم الي بدا كلشي
          </div>
        )}
      </div>
    </div>
  );
}
