'use client';
//kasutatud Groki abi
import { useState } from 'react';

interface Entry {
  id: string;
  Name: string;
  Variant: string;
  Description: string;
  created_at: string;
}

interface EntriesClientProps {
  initialEntries: Entry[];
}

export default function EntriesClient({ initialEntries }: EntriesClientProps) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [newName, setNewName] = useState('');
  const [newVariant, setNewVariant] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null); // Track entry being edited
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a new entry
  const addEntry = async () => {
    if (!newName.trim() || !newVariant.trim() || !newDescription.trim()) {
      setError('All fields cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name: newName.trim(), Variant: newVariant.trim(), Description: newDescription.trim() }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const rawText = await response.text();
        throw new Error(`Expected JSON, got ${contentType}: ${rawText.slice(0, 100)}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Failed to add entry (status: ${response.status})`);
      }

      setEntries([data, ...entries]); // Add new entry to the list
      setNewName('');
      setNewVariant('');
      setNewDescription('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add entry';
      setError(errorMessage);
      console.error('Add entry error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update an entry
  const updateEntry = async (id: string, Name: string, Variant: string, Description: string) => {
    if (!Name.trim() || !Variant.trim() || !Description.trim()) {
      setError('All fields cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/entry/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name: Name.trim(), Variant: Variant.trim(), Description: Description.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update entry');
      }

      const updatedEntry = await response.json();
      setEntries(entries.map((entry) => (entry.id === id ? updatedEntry : entry))); // Update entry in list
      setEditingEntry(null); // Exit edit mode
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      console.error('Update entry error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete an entry
  const deleteEntry = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/entry/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete entry');
      }

      setEntries(entries.filter((entry) => entry.id !== id)); // Remove entry from list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    } finally {
      setLoading(false);
    }
  };

  // Start editing an entry
  const startEditing = (entry: Entry) => {
    setEditingEntry(entry);
    setError(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingEntry(null);
    setError(null);
  };

  return (
    <>
      {/* Add Entry Form */}
      <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
        <div className="space-y-4 mb-4">
          <input
            id="new-Name"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Field 1 (e.g., Name)..."
            disabled={loading}
          />
          <input
            id="new-Variant"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            value={newVariant}
            onChange={(e) => setNewVariant(e.target.value)}
            placeholder="Field 2 (e.g., Email)..."
            disabled={loading}
          />
          <input
            id="new-Description"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Field 3 (e.g., Notes)..."
            disabled={loading}
          />
        </div>
        <button
          onClick={addEntry}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {loading ? 'Adding...' : 'Add Entry'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6 text-center font-medium">
          {error}
        </p>
      )}

      {/* Entries List */}
      <div>
        {loading && <p className="text-gray-600 text-center">Updating...</p>}
        {entries.length === 0 && !loading && (
          <p className="text-gray-600 text-center">No entries available.</p>
        )}
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition duration-200"
            >
              {editingEntry?.id === entry.id ? (
                <div className="space-y-4">
                  <input
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    value={editingEntry.Name}
                    onChange={(e) => setEditingEntry({ ...editingEntry, Name: e.target.value })}
                    disabled={loading}
                  />
                  <input
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    value={editingEntry.Variant}
                    onChange={(e) => setEditingEntry({ ...editingEntry, Variant: e.target.value })}
                    disabled={loading}
                  />
                  <input
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    value={editingEntry.Description}
                    onChange={(e) => setEditingEntry({ ...editingEntry, Description: e.target.value })}
                    disabled={loading}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateEntry(entry.id, editingEntry.Name, editingEntry.Variant, editingEntry.Description)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium flex-1"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-800 font-medium">Field 1: {entry.Name}</p>
                    <p className="text-gray-800">Field 2: {entry.Variant}</p>
                    <p className="text-gray-800">Field 3: {entry.Description}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(entry)}
                      disabled={loading}
                      className="px-4 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      disabled={loading}
                      className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}