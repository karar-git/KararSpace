import { useCallback } from 'react';
import { Grip, Segmented, ToTopIcon } from '../bits';
import { addedTag } from '../dates';
import { findLink, noteText } from '../links';
import { moveItem, useVerticalReorder } from '../useReorder';
import type { Note, NoteList, Theme } from '../api';

const LOOKS: Array<{ value: Theme; label: string }> = [
  { value: 'deck', label: 'cards' },
  { value: 'someday', label: 'someday' },
  { value: 'places', label: 'map' },
  { value: 'ritual', label: 'ritual' },
  { value: 'dates', label: 'our dates' },
];

/**
 * Every list can be arranged the same way: hold the dots and drag, or send a
 * note straight to the top. The top one is what comes up next.
 */
export default function ArrangeView({
  list,
  notes,
  lists,
  onReorderNotes,
  onReorderLists,
  onTheme,
  onRename,
  onRemove,
  onDone,
}: {
  list: NoteList;
  notes: Note[];
  lists: NoteList[];
  onReorderNotes: (next: Note[]) => void;
  onReorderLists: (next: NoteList[]) => void;
  onTheme: (theme: Theme) => void;
  onRename: () => void;
  onRemove: (() => void) | null;
  onDone: () => void;
}) {
  const dropNote = useCallback(
    (from: number, to: number) => onReorderNotes(moveItem(notes, from, to)),
    [notes, onReorderNotes]
  );
  const dropList = useCallback(
    (from: number, to: number) => onReorderLists(moveItem(lists, from, to)),
    [lists, onReorderLists]
  );
  const rows = useVerticalReorder(dropNote);
  const chips = useVerticalReorder(dropList);

  return (
    <div className="us2-arrange">
      <div className="us2-titlerow">
        <div>
          <h2 className="us2-title">arrange the list</h2>
          <div className="us2-sub">Drag the dots to move a note. The top one comes up next.</div>
        </div>
        <button type="button" className="us2-done-btn" onClick={onDone}>
          done
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="us2-sub" style={{ textAlign: 'center' }}>
          nothing on this list yet.
        </p>
      ) : (
        <div className="us2-rows" ref={rows.containerRef}>
          {notes.map((note, index) => {
            const first = index === 0;
            const link = findLink(note.body);
            const tag = first
              ? 'up next'
              : `${link ? `${link.kind} · ` : ''}${note.done ? 'done · ' : ''}${addedTag(note.createdAt)}`;
            return (
              <div
                key={note.id}
                data-row
                className={`us2-row${first ? ' first' : ''}${rows.liftedIndex === index ? ' lifted' : ''}`}
                style={rows.rowStyle(index)}
              >
                <Grip onPointerDown={rows.start(index)} />
                <div className="us2-row-text">
                  <div className="us2-row-body" dir="auto">
                    {noteText(note.body)}
                  </div>
                  <div className={first ? 'us2-row-tag first' : 'us2-row-tag'}>{tag}</div>
                </div>
                <button
                  type="button"
                  className="us2-totop"
                  title="move to the top"
                  aria-label="move to the top"
                  tabIndex={first ? -1 : 0}
                  onClick={() => onReorderNotes(moveItem(notes, index, 0))}
                >
                  <ToTopIcon />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="us2-hint">The arrow sends a note straight to the top.</p>

      <section className="us2-arrange-more">
        <h3>how this list looks</h3>
        <Segmented
          className="wrap"
          value={list.theme}
          options={LOOKS}
          onChange={(theme) => theme !== list.theme && onTheme(theme)}
        />
        <div className="us2-arrange-links">
          <button type="button" className="us-linkish" onClick={onRename}>
            rename this list
          </button>
          {onRemove && (
            <button type="button" className="us-linkish" onClick={onRemove}>
              remove this list
            </button>
          )}
        </div>
      </section>

      {lists.length > 1 && (
        <section className="us2-arrange-more">
          <h3>the order of the lists</h3>
          <div className="us2-rows" ref={chips.containerRef}>
            {lists.map((item, index) => (
              <div
                key={item.id}
                data-row
                className={`us2-row small${chips.liftedIndex === index ? ' lifted' : ''}`}
                style={chips.rowStyle(index)}
              >
                <Grip onPointerDown={chips.start(index)} />
                <div className="us2-row-text">
                  <div className="us2-row-body" dir="auto">
                    {item.name}
                  </div>
                </div>
                <button
                  type="button"
                  className="us2-totop"
                  aria-label="move to the front"
                  tabIndex={index === 0 ? -1 : 0}
                  onClick={() => onReorderLists(moveItem(lists, index, 0))}
                >
                  <ToTopIcon />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
