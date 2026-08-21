import { Heart } from './icons';
import { addedTag } from './dates';
import type { Note } from './api';

interface NotePanelProps {
  note: Note;
  eyebrow?: string;
  onToggleDone: (note: Note) => void;
  onDelete?: (note: Note) => void;
  onEditLabel?: (note: Note) => void;
}

export default function NotePanel({
  note,
  eyebrow,
  onToggleDone,
  onDelete,
  onEditLabel,
}: NotePanelProps) {
  const label = eyebrow ?? (note.done ? 'already talked about' : 'up next');
  const color = note.author === 'karar' ? 'var(--karar)' : 'var(--dania)';

  return (
    <div className="us-panel">
      <div className="us-eyebrow">{label}</div>
      <p className="us-panel-body" style={note.done ? { color: 'var(--dim)' } : undefined}>
        {note.body}
      </p>
      <div className="us-panel-meta">
        added by <strong style={{ color }}>{note.author}</strong> · {addedTag(note.createdAt)}
      </div>

      {note.photoUrl && <img className="us-panel-photo" src={note.photoUrl} alt="" />}

      <div className="us-panel-actions">
        <button
          type="button"
          className={note.done ? 'us-pill' : 'us-pill filled'}
          onClick={() => onToggleDone(note)}
        >
          <Heart size={15} fill={note.done ? 'var(--accent)' : '#fff'} />
          {note.done ? 'done' : 'mark done'}
        </button>
        {onEditLabel && (
          <button type="button" className="us-pill ghost" onClick={() => onEditLabel(note)}>
            wheel label
          </button>
        )}
        {onDelete && (
          <button type="button" className="us-pill ghost" onClick={() => onDelete(note)}>
            remove
          </button>
        )}
      </div>
    </div>
  );
}
