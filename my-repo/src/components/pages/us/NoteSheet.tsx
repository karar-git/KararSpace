import type { ReactNode } from 'react';
import { Heart } from './icons';
import { Sheet, LinkCard } from './bits';
import { addedTag } from './dates';
import { findLink } from './links';
import { photoSrc, type Note } from './api';

export interface NoteActions {
  onToggleDone: (note: Note) => void;
  onDelete: (note: Note) => void;
  onEditLabel: (note: Note) => void;
  onEditBody: (note: Note) => void;
}

/** Everything you can do to one note, for the looks that have no room for it on the card */
export default function NoteSheet({
  note,
  actions,
  doneLabel = ['mark done', 'done'],
  extra,
  onClose,
}: {
  note: Note;
  actions: NoteActions;
  doneLabel?: [string, string];
  extra?: ReactNode;
  onClose: () => void;
}) {
  const link = findLink(note.body);

  return (
    <Sheet onClose={onClose}>
      <div className="us-eyebrow">{addedTag(note.createdAt)}</div>
      <p className="us2-sheet-body" dir="auto">
        {link ? link.caption || link.label : note.body}
      </p>
      {link && <LinkCard link={link} />}
      {note.photoUrl && <img className="us-panel-photo" src={photoSrc(note.photoUrl)} alt="" />}
      <div className="us-panel-actions">
        {extra}
        <button
          type="button"
          className={note.done ? 'us-pill' : 'us-pill filled'}
          onClick={() => actions.onToggleDone(note)}
        >
          <Heart size={15} fill={note.done ? 'var(--accent)' : '#fff'} />
          {note.done ? doneLabel[1] : doneLabel[0]}
        </button>
        <button type="button" className="us-pill ghost" onClick={() => actions.onEditBody(note)}>
          edit
        </button>
        <button type="button" className="us-pill ghost" onClick={() => actions.onEditLabel(note)}>
          wheel label
        </button>
        <button
          type="button"
          className="us-pill ghost"
          onClick={() => {
            actions.onDelete(note);
          }}
        >
          remove
        </button>
      </div>
    </Sheet>
  );
}
