'use client';

import { useState } from 'react';

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface NotesClientProps {
  initialNotes: Note[];
}

export default function NotesClient({ initialNotes }: NotesClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a new note
  const addNote = async () => {
    if (!newNote.trim()) {
      setError('Note cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add note');
      }

      setNewNote('');
      revalidatePath('/notes'); // Soft refresh: re-fetches server data without full reload
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  // Delete a note
  const deleteNote = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete note');
      }

      revalidatePath('/notes'); // Soft refresh: re-fetches server data without full reload
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Add Note Form */}
      <div className="mb-4">
        <textarea
          id="new-note"
          className="w-full p-2 border rounded-md"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a new note..."
          rows={4}
          disabled={loading}
        />
        <button
          onClick={addNote}
          disabled={loading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Adding...' : 'Add Note'}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Notes List */}
      <div>
        {loading && <p className="text-gray-500">Updating...</p>}
        {notes.length === 0 && !loading && <p>No notes available.</p>}
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id} className="p-4 border rounded-md flex justify-between items-start">
              <div>
                <p>{note.content}</p>
                <p className="text-sm text-gray-500">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                disabled={loading}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}