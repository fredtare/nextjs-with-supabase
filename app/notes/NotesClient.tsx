'use client';
//kasutatud Groki abi
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
  const [editingNote, setEditingNote] = useState<Note | null>(null);
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
      const response = await fetch('/api/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      const contentType = response.headers.get('content-type') || '';
      console.log('Content-Type:', contentType);

      if (response.status >= 300 && response.status < 400) {
        throw new Error(`Received redirect (status: ${response.status}) to ${response.headers.get('location') || 'unknown location'}`);
      }

      if (!contentType.includes('application/json')) {
        const rawText = await response.text();
        console.log('Raw response:', rawText);
        throw new Error(`Expected JSON, got ${contentType}: ${rawText.slice(0, 100)}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Failed to add note (status: ${response.status})`);
      }

      setNotes([data, ...notes]); // Add new note to state
      setNewNote('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add note';
      setError(errorMessage);
      console.error('Add note error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update a note
  const updateNote = async (id: string, content: string) => {
    if (!content.trim()) {
      setError('Note cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/note/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update note');
      }

      const updatedNote = await response.json();
      setNotes(notes.map((note) => (note.id === id ? updatedNote : note))); // Update note in list
      setEditingNote(null); // Exit edit mode
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      console.error('Update note error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a note
  const deleteNote = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/note/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete note');
      }

      setNotes(notes.filter((note) => note.id !== id)); // Remove note from state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  // Start editing a note
  const startEditing = (note: Note) => {
    setEditingNote(note);
    setError(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingNote(null);
    setError(null);
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
              {editingNote?.id === note.id ? (
                <div className="w-full">
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none"
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    rows={4}
                    disabled={loading}
                  />
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => updateNote(note.id, editingNote.content)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-gray-800">{note.content}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(note)}
                      disabled={loading}
                      className="px-4 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      disabled={loading}
                      className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}