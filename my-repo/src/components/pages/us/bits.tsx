import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Heart, CameraIcon, ArrowUp } from './icons';
import { photoSrc, uploadPhoto } from './api';
import type { FoundLink } from './links';

/* Small pieces shared by every list look. Colours come from the theme's
   CSS variables, so the same piece fits the pink, night, river and peach pages. */

export function PlayIcon({ size = 16, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M7 4.5v11l9-5.5z" fill={color} />
    </svg>
  );
}

export function PlusIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M4.5 10.5l3.5 3.5 7.5-8"
        stroke="#ffffff"
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ToTopIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M5 3.5h10M10 17V7.5M6 11l4-4 4 4"
        stroke="currentColor"
        strokeWidth={1.9}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Arrow({ dir, size = 16 }: { dir: 'left' | 'right'; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M12.5 4L6.5 10l6 6' : 'M7.5 4l6 6-6 6'}
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Six dots: the thing you hold to drag a row */
export function Grip({ onPointerDown, label = 'drag to move' }: {
  onPointerDown: (event: React.PointerEvent) => void;
  label?: string;
}) {
  return (
    <span className="us2-grip" onPointerDown={onPointerDown} aria-label={label} role="button">
      <svg width="14" height="20" viewBox="0 0 14 20" aria-hidden="true">
        {[4, 10, 16].map((cy) => (
          <g key={cy}>
            <circle cx="4" cy={cy} r="1.8" fill="currentColor" />
            <circle cx="10" cy={cy} r="1.8" fill="currentColor" />
          </g>
        ))}
      </svg>
    </span>
  );
}

/** A reel's or video's player, in a sheet. YouTube needs a referrer to play,
    which the page itself does not send, so the frame asks for one. */
export function PlayerSheet({ link, onClose }: { link: FoundLink; onClose: () => void }) {
  return (
    <Sheet onClose={onClose} className="us2-player-sheet">
      {link.embed ? (
        <iframe
          className={link.kind === 'video' ? 'us2-player video' : 'us2-player reel'}
          src={link.embed}
          title={link.label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : null}
      <div className="us-panel-actions">
        <a className="us-pill" href={link.url} target="_blank" rel="noopener noreferrer">
          open in {link.kind === 'video' ? 'youtube' : 'instagram'}
        </a>
        <button type="button" className="us-pill ghost" onClick={onClose}>
          close
        </button>
      </div>
    </Sheet>
  );
}

/** A reel, post or video as a picture with a play button instead of a raw URL.
    YouTube plays right in the card; Instagram opens its own player in a sheet. */
export function LinkCard({ link }: { link: FoundLink }) {
  const [playing, setPlaying] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [broken, setBroken] = useState(false);
  const showThumb = !!link.thumb && !broken;

  const play = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!link.embed) {
      window.open(link.url, '_blank', 'noopener');
    } else if (link.kind === 'video') {
      setPlaying(true);
    } else {
      setSheet(true);
    }
  };

  return (
    <div className={`us2-media ${link.kind}`} onClick={(event) => event.stopPropagation()}>
      {playing && link.embed ? (
        <iframe
          className="us2-media-frame"
          src={link.embed}
          title={link.label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" className="us2-media-thumb" aria-label={`play the ${link.label}`} onClick={play}>
          {showThumb ? (
            <img src={link.thumb!} alt="" loading="lazy" onError={() => setBroken(true)} />
          ) : (
            <span className="us2-media-blank" />
          )}
          <span className="us2-media-play">
            <PlayIcon size={22} />
          </span>
        </button>
      )}
      <a
        className="us2-media-foot"
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
      >
        <b>{link.label}</b>
        <small>open in {link.kind === 'video' ? 'youtube' : link.kind === 'link' ? 'a new tab' : 'instagram'} ↗</small>
      </a>
      {sheet && <PlayerSheet link={link} onClose={() => setSheet(false)} />}
    </div>
  );
}

/** Hearts you tap to score something out of five. Tapping the current score clears it. */
export function HeartScore({
  value,
  onChange,
  size = 22,
  color = 'var(--accent)',
}: {
  value: number;
  onChange?: (next: number) => void;
  size?: number;
  color?: string;
}) {
  return (
    <span className="us2-hearts">
      {[1, 2, 3, 4, 5].map((score) =>
        onChange ? (
          <button
            key={score}
            type="button"
            className="us2-heart-tap"
            aria-label={`${score} of 5`}
            onClick={() => onChange(value === score ? 0 : score)}
          >
            <Heart size={size} fill={score <= value ? color : 'none'} stroke={color} strokeWidth={1.5} />
          </button>
        ) : (
          <Heart
            key={score}
            size={size}
            fill={score <= value ? color : 'none'}
            stroke={color}
            strokeWidth={1.6}
          />
        )
      )}
    </span>
  );
}

/** Two or three pills, one picked */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className = '',
}: {
  value: T;
  options: Array<{ value: T; label: ReactNode; color?: string }>;
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div className={`us2-seg ${className}`} role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={option.value === value ? 'on' : ''}
          style={option.value === value && option.color ? { background: option.color } : undefined}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** A sheet that slides up from the bottom. Tap outside or press Escape to close. */
export function Sheet({
  onClose,
  children,
  className = '',
}: {
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="us2-sheet-back" onClick={onClose}>
      <div
        className={`us2-sheet ${className}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="us2-sheet-handle" />
        {children}
      </div>
    </div>
  );
}

/**
 * The "add something…" box at the bottom of a list. A pill until you type, then
 * it grows a photo button and a send button.
 */
export function Composer({
  placeholder,
  onAdd,
  onError,
  allowPhoto = true,
}: {
  placeholder: string;
  onAdd: (body: string, photoUrl: string | null) => Promise<void>;
  onError: (message: string) => void;
  allowPhoto?: boolean;
}) {
  const [body, setBody] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const open = focused || !!body || !!photo;

  const pickPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      setPhoto(await uploadPhoto(file));
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd(body.trim(), photo);
      setBody('');
      setPhoto(null);
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={open ? 'us2-composer open' : 'us2-composer'}>
      <div className="us2-composer-line">
        <PlusIcon color="var(--accent)" />
        <textarea
          dir="auto"
          rows={open ? 2 : 1}
          placeholder={placeholder}
          value={body}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) submit();
          }}
        />
      </div>
      {open && (
        <div className="us2-composer-row">
          {allowPhoto &&
            (photo ? (
              <button type="button" className="us-chip on" onClick={() => setPhoto(null)}>
                <img className="us-thumb" src={photoSrc(photo)} alt="" />
                remove
              </button>
            ) : (
              <button
                type="button"
                className="us-chip"
                // Keep the box open while the file picker is up
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => fileRef.current?.click()}
              >
                <CameraIcon />
                photo
              </button>
            ))}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
          <button
            type="button"
            className="us-add-send"
            aria-label="add"
            disabled={!body.trim() || busy}
            onMouseDown={(event) => event.preventDefault()}
            onClick={submit}
          >
            <ArrowUp />
          </button>
        </div>
      )}
    </div>
  );
}
