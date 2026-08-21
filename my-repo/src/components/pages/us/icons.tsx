/** One heart path, reused everywhere at different sizes and fills. */
export const HEART_PATH =
  'M12 20.7l-1.4-1.3C5.4 14.9 2 11.8 2 8.2 2 5.4 4.2 3.2 7 3.2c1.6 0 3.1.7 4 1.9.9-1.2 2.4-1.9 4-1.9 2.8 0 5 2.2 5 5 0 3.6-3.4 6.7-8.6 11.2L12 20.7z';

interface HeartProps {
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
}

export function Heart({
  size = 21,
  fill = 'currentColor',
  stroke,
  strokeWidth = 1.4,
  className,
}: HeartProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d={HEART_PATH}
        fill={fill}
        stroke={stroke}
        strokeWidth={stroke ? strokeWidth : undefined}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The thin outlined heart the day count sits inside. */
export function HeartOutline({ color = '#f2a8c4' }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={HEART_PATH} fill="none" stroke={color} strokeWidth={0.8} strokeLinejoin="round" />
    </svg>
  );
}

export function Chevron({ dir = 'right', size = 18 }: { dir?: 'left' | 'right'; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : undefined }}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowUp({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function CameraIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
