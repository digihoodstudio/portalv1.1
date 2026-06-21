"use client";
import { useState, useEffect } from "react";
import { StickyNote, Plus, Trash2 } from "lucide-react";

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user-notes");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  const save = (next: Note[]) => {
    setNotes(next);
    localStorage.setItem("user-notes", JSON.stringify(next));
  };

  const addNote = () => {
    if (!text.trim()) return;
    save([
      { id: Date.now().toString(), text, createdAt: new Date().toISOString() },
      ...notes,
    ]);
    setText("");
  };

  const deleteNote = (id: string) => save(notes.filter((n) => n.id !== id));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-white mb-2 flex items-center gap-3">
        <StickyNote className="text-gold" /> My Notes
      </h1>
      <p className="text-foreground/60 mb-8">
        Quick notes — saved locally on your browser.
      </p>

      <div className="flex gap-2 mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a quick note..."
          rows={3}
          className="flex-1 rounded-2xl border border-white/10 bg-[#0c1433]/80 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-gold/50"
        />
        <button
          onClick={addNote}
          className="self-start rounded-2xl bg-gold px-5 py-3 text-background font-bold hover:brightness-110"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-2xl border border-white/10 bg-glass p-4"
          >
            <p className="text-white/90 whitespace-pre-wrap text-sm">
              {note.text}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-white/40">
              <span>{new Date(note.createdAt).toLocaleString()}</span>
              <button
                onClick={() => deleteNote(note.id)}
                className="hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-white/40 text-sm">
            No notes yet. Add your first one above.
          </p>
        )}
      </div>
    </div>
  );
}
