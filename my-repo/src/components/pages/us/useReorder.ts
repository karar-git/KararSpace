import { useCallback, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

/** While a finger is down on a handle, the polling loop leaves the lists alone. */
export const dragging = { active: false };

interface Drag {
  from: number;
  over: number;
  dy: number;
  /** One row's height plus the gap, so the others slide by exactly a row */
  h: number;
}

/**
 * Drag rows up and down by a handle. Rows are the children of the container
 * that carry `data-row`. The other rows slide out of the way while you drag,
 * and `onDrop(from, to)` runs once you let go.
 */
export function useVerticalReorder(onDrop: (from: number, to: number) => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [settling, setSettling] = useState(false);
  const moved = useRef(false);

  const start = useCallback(
    (index: number) => (event: ReactPointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const container = containerRef.current;
      if (!container) return;
      event.preventDefault();

      const rows = Array.from(container.querySelectorAll<HTMLElement>(':scope > [data-row]'));
      const rects = rows.map((row) => row.getBoundingClientRect());
      if (!rects[index]) return;
      const gap = rects.length > 1 ? Math.max(0, rects[1].top - rects[0].bottom) : 0;
      const h = rects[index].height + gap;
      const startY = event.clientY;

      moved.current = false;
      dragging.active = true;
      let current: Drag = { from: index, over: index, dy: 0, h };
      setDrag(current);

      const move = (ev: PointerEvent) => {
        const y = ev.clientY;
        let over = index;
        for (let k = 0; k < index; k += 1) {
          if (y < rects[k].top + rects[k].height / 2) {
            over = k;
            break;
          }
        }
        if (over === index) {
          for (let k = rects.length - 1; k > index; k -= 1) {
            if (y > rects[k].top + rects[k].height / 2) {
              over = k;
              break;
            }
          }
        }
        if (Math.abs(y - startY) > 4) moved.current = true;
        current = { from: index, over, dy: y - startY, h };
        setDrag(current);
      };

      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        dragging.active = false;
        // The rows re-render in their new order with no offset; skip the
        // transition for that one frame so nothing jumps.
        setSettling(true);
        setDrag(null);
        if (current.from !== current.over) onDrop(current.from, current.over);
        requestAnimationFrame(() => requestAnimationFrame(() => setSettling(false)));
      };

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    },
    [onDrop]
  );

  const rowStyle = (index: number): CSSProperties => {
    if (!drag) {
      return settling ? { transition: 'none', transform: 'none' } : { transform: 'none' };
    }
    if (index === drag.from) {
      return {
        transition: 'none',
        zIndex: 50,
        position: 'relative',
        transform: `translateY(${drag.dy.toFixed(1)}px) scale(1.02)`,
      };
    }
    let shift = 0;
    if (drag.from < drag.over && index > drag.from && index <= drag.over) shift = -drag.h;
    if (drag.from > drag.over && index >= drag.over && index < drag.from) shift = drag.h;
    return { transform: `translateY(${shift}px)` };
  };

  return {
    containerRef,
    start,
    rowStyle,
    liftedIndex: drag?.from ?? null,
    /** True right after a drag, so the click that ends it can be ignored */
    wasDrag: () => moved.current,
  };
}

/**
 * Drag tiles around a grid. The order changes live as you move over another
 * tile; `onChange` gets the new order every time it does.
 */
export function useGridReorder<T>(items: T[], onChange: (next: T[]) => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lift, setLift] = useState<{ item: T; dx: number; dy: number } | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const start = (index: number) => (event: ReactPointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const container = containerRef.current;
    if (!container) return;
    event.preventDefault();

    const tiles = Array.from(container.querySelectorAll<HTMLElement>(':scope > [data-tile]'));
    const rects = tiles.map((tile) => tile.getBoundingClientRect());
    const sx = event.clientX;
    const sy = event.clientY;
    const item = itemsRef.current[index];
    let cur = index;
    dragging.active = true;
    setLift({ item, dx: 0, dy: 0 });

    const move = (ev: PointerEvent) => {
      let best = cur;
      let bestDistance = Infinity;
      rects.forEach((rect, k) => {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distance = (ev.clientX - cx) ** 2 + (ev.clientY - cy) ** 2;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = k;
        }
      });
      if (best !== cur) {
        const next = itemsRef.current.slice();
        next.splice(cur, 1);
        next.splice(best, 0, item);
        cur = best;
        onChange(next);
      }
      setLift({
        item,
        dx: ev.clientX - sx - (rects[cur].left - rects[index].left),
        dy: ev.clientY - sy - (rects[cur].top - rects[index].top),
      });
    };

    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      dragging.active = false;
      setLift(null);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const tileStyle = (item: T): CSSProperties =>
    lift && lift.item === item
      ? {
          zIndex: 50,
          transform: `translate(${lift.dx.toFixed(1)}px, ${lift.dy.toFixed(1)}px) scale(1.1)`,
          boxShadow: '0 16px 30px rgba(44, 34, 48, 0.28)',
        }
      : {};

  return { containerRef, start, tileStyle };
}

/** Move one item of a list from `from` to `to`. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
