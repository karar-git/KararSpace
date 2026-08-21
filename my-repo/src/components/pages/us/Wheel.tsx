import { useRef, useState } from 'react';
import { Heart } from './icons';
import type { Note } from './api';

const R = 170; // the wheel is drawn at 340px and scaled by CSS
const LABEL_COLORS = ['var(--text)', 'var(--text)', '#ffffff'];
const SEGMENT_COLORS = ['var(--wheel-1)', 'var(--wheel-2)', 'var(--wheel-3)'];
const SPIN_MS = 3100;

function point(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return [R + radius * Math.cos(rad), R + radius * Math.sin(rad)];
}

const FILLER = new Set(['i', 'we', 'you', 'the', 'a', 'an', 'my', 'our', 'that', 'it', 'to']);

/** Short two-line label for a segment: whatever was saved, else the first words that mean something. */
export function segmentLabel(note: Note): string[] {
  const raw = note.spinLabel?.trim();
  if (raw) return raw.split('\n').slice(0, 2);

  const words = note.body.trim().split(/\s+/).filter(Boolean);
  let start = 0;
  while (start < words.length - 1 && FILLER.has(words[start].toLowerCase())) start += 1;
  return words.slice(start, start + 2);
}

interface WheelProps {
  segments: Note[];
  onLanded: (note: Note) => void;
  onSpinStart?: () => void;
}

export default function Wheel({ segments, onLanded, onSpinStart }: WheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const spinCount = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const count = Math.max(segments.length, 1);
  const seg = 360 / count;
  const available = segments.filter((note) => !note.done);

  const spin = () => {
    if (spinning || available.length === 0) return;

    const chosen = available[Math.floor(Math.random() * available.length)];
    const index = segments.findIndex((note) => note.id === chosen.id);

    spinCount.current += 1;
    setSpinning(true);
    onSpinStart?.();
    // Four extra turns (1440° is a whole number of rotations) then land the
    // centre of segment `index` under the pointer at 12 o'clock.
    setRotation(1440 * spinCount.current - (index * seg + seg / 2));

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSpinning(false);
      onLanded(chosen);
    }, SPIN_MS);
  };

  return (
    <div className="us-wheel-wrap">
      <div className="us-pointer">
        <Heart size={34} fill="var(--accent)" />
      </div>

      <svg
        className={`us-wheel${spinning ? ' us-wheel-spinning' : ''}`}
        viewBox={`0 0 ${R * 2} ${R * 2}`}
        style={{ transform: `rotate(${rotation}deg)` }}
        aria-hidden="true"
      >
        {segments.map((note, index) => {
          const start = -90 + index * seg;
          const end = start + seg;
          const [x1, y1] = point(start, R);
          const [x2, y2] = point(end, R);
          const largeArc = seg > 180 ? 1 : 0;
          const centre = start + seg / 2;
          const [lx, ly] = point(centre, R * 0.62);
          const lines = segmentLabel(note).map((line) =>
            line.length > 12 ? `${line.slice(0, 11)}…` : line
          );
          const colorIndex = index % 3;
          // Keep every label the right way up: flip the ones on the left half,
          // and swap the two lines back so they still read top to bottom.
          const normalised = ((centre % 360) + 360) % 360;
          const flipped = normalised > 90 && normalised < 270;
          const ordered = flipped ? [...lines].reverse() : lines;

          return (
            <g key={note.id}>
              <path
                d={
                  count === 1
                    ? `M ${R} ${R - R} A ${R} ${R} 0 1 1 ${R - 0.01} ${R - R} Z`
                    : `M ${R} ${R} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`
                }
                fill={note.done ? 'var(--wheel-done)' : SEGMENT_COLORS[colorIndex]}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                transform={`rotate(${centre + (flipped ? 180 : 0)} ${lx} ${ly})`}
                fill={note.done ? 'var(--wheel-done-label)' : LABEL_COLORS[colorIndex]}
                fontFamily="Quicksand, 'Trebuchet MS', sans-serif"
                fontSize={14}
                fontWeight={600}
              >
                {ordered.map((line, lineIndex) => (
                  <tspan key={line + lineIndex} x={lx} dy={lineIndex === 0 ? -2 : 16}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>

      <button
        type="button"
        className="us-hub"
        onClick={spin}
        disabled={spinning || available.length === 0}
      >
        <Heart size={22} fill="var(--accent)" />
        <span>{spinning ? '...' : 'spin'}</span>
      </button>
    </div>
  );
}
