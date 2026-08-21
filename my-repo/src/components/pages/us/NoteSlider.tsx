import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { Heart, Chevron } from './icons';
import { addedTag } from './dates';
import type { Note } from './api';

const GAP = 18;

interface NoteSliderProps {
  notes: Note[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onToggleDone: (note: Note) => void;
}

export default function NoteSlider({
  notes,
  activeIndex,
  onSelect,
  onToggleDone,
}: NoteSliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [drag, setDrag] = useState(0);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const measure = () => setWidth(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const cardWidth = width === 0 ? 236 : width < 560 ? Math.min(268, width - 76) : 236;
  const offset = width / 2 - cardWidth / 2 - activeIndex * (cardWidth + GAP) + drag;

  const step = (delta: number) => {
    const next = (activeIndex + delta + notes.length) % notes.length;
    onSelect(next);
  };

  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    moved.current = false;
    dragStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    const start = dragStart.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // Let the page scroll if the gesture is mostly vertical
    if (!dragging && Math.abs(dx) < 8) return;
    if (!dragging && Math.abs(dy) > Math.abs(dx)) {
      dragStart.current = null;
      return;
    }
    if (!dragging) {
      moved.current = true;
      setDragging(true);
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }
    setDrag(dx);
  };

  const endDrag = () => {
    const dx = drag;
    dragStart.current = null;
    setDragging(false);
    setDrag(0);
    const threshold = Math.min(60, cardWidth * 0.22);
    if (Math.abs(dx) > threshold) {
      const next = dx < 0 ? activeIndex + 1 : activeIndex - 1;
      onSelect(Math.max(0, Math.min(notes.length - 1, next)));
    }
  };

  return (
    <div className="us-slider">
      <div
        className="us-viewport"
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className={dragging ? 'us-track' : 'us-track animate'}
          style={{ transform: `translate3d(${offset}px, 0, 0)` }}
        >
          {notes.map((note, index) => {
            const active = index === activeIndex;
            return (
              <div
                key={note.id}
                role="button"
                tabIndex={0}
                aria-current={active}
                className={`us-card${active ? ' active' : ''}${note.done ? ' done' : ''}`}
                style={{ width: cardWidth, marginRight: index === notes.length - 1 ? 0 : GAP }}
                onClick={() => {
                  // A swipe ends in a click on the card it started from — ignore it
                  if (moved.current) return;
                  onSelect(index);
                }}
                onKeyDown={(event: ReactKeyboardEvent) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(index);
                  }
                }}
              >
                <div className="us-card-top">
                  <span className="us-card-when">{addedTag(note.createdAt)}</span>
                  <button
                    type="button"
                    className="us-heart-btn"
                    aria-label={note.done ? 'we talked about this' : 'mark as talked about'}
                    aria-pressed={note.done}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleDone(note);
                    }}
                  >
                    <Heart
                      size={21}
                      fill={note.done ? 'var(--accent)' : 'none'}
                      stroke={note.done ? 'var(--accent)' : 'var(--card-border-active)'}
                    />
                  </button>
                </div>

                <p className="us-card-body">{note.body}</p>

                <div className="us-card-tag">
                  {note.photoUrl && <span className="us-card-photo-dot" />}
                  {note.done ? 'talked about' : 'up next'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {notes.length > 1 && (
        <div className="us-arrows">
          <button type="button" className="us-arrow" aria-label="previous" onClick={() => step(-1)}>
            <Chevron dir="left" />
          </button>
          <button type="button" className="us-arrow" aria-label="next" onClick={() => step(1)}>
            <Chevron dir="right" />
          </button>
        </div>
      )}

      {notes.length > 1 && (
        <div className="us-dots">
          {notes.map((note, index) => (
            <button
              key={note.id}
              type="button"
              className={`us-dot${index === activeIndex ? ' on' : ''}`}
              aria-label={`note ${index + 1}`}
              onClick={() => onSelect(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
