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

      // Log raw response for debugging
      const rawText = await response.text();
      console.log('Raw response:', rawText);

      // Try parsing JSON
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid server response format');
      }

      if (!response.ok) {
        throw new Error(data.error || `Failed to add note (status: ${response.status})`);
      }

      setNewNote('');
      revalidatePath('/notes');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add note';
      setError(errorMessage);
      console.error('Add note error:', err);
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
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete note');
      }

      revalidatePath('/notes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Add Note Form */}
      <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
        <textarea
          id="new-note"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a new note..."
          rows={4}
          disabled={loading}
        />
        <button
          onClick={addNote}
          disabled={loading}
          className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {loading ? 'Adding...' : 'Add Note'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6 text-center font-medium">
          {error}
        </p>
      )}

      {/* Notes List */}
      <div>
        {loading && (
          <p className="text-gray-600 text-center">Updating...</p>
        )}
        {notes.length === 0 && !loading && (
          <p className="text-gray-600 text-center">No notes available.</p>
        )}
        <ul className="space-y-4">
          {notes.map((note) => (
            <li
              key={note.id}
              className="p-6 bg-white shadow-md rounded-lg flex justify-between items-start hover:shadow-lg transition duration-200"
            >
              <div>
                <p className="text-gray-800">{note.content}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                disabled={loading}
                className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
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