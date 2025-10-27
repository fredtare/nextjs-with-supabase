'use client';

import { useState, useEffect } from 'react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

interface FlashcardClientProps {
  initialFlashcards: Flashcard[];
}

export default function FlashcardClient({ initialFlashcards }: FlashcardClientProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

  // Calculate percentage of correct answers
  const calculateCorrectPercentage = () => {
    const total = stats.correct + stats.incorrect;
    if (total === 0) return 'N/A';
    return ((stats.correct / total) * 100).toFixed(2) + '%';
  };

  // Select a random flashcard on mount or when flashcards change
  useEffect(() => {
    pickRandomFlashcard();
  }, [flashcards]);

  const pickRandomFlashcard = () => {
    if (flashcards.length === 0) {
      setCurrentFlashcard(null);
      setShowAnswer(false);
      return;
    }
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    setCurrentFlashcard(flashcards[randomIndex]);
    setShowAnswer(false);
  };

  // Handle Correct/Incorrect clicks
  const handleCorrect = () => {
    setStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
    pickRandomFlashcard();
  };

  const handleIncorrect = () => {
    setStats((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    pickRandomFlashcard();
  };

  // Add a new flashcard
  const addFlashcard = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setError('Question and answer cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = { question: newQuestion.trim(), answer: newAnswer.trim() };
      console.log('Submitting payload:', payload);

      const response = await fetch('/api/flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      const contentType = response.headers.get('content-type') || '';
      console.log('Content-Type:', contentType);

      if (!response.ok) {
        const text = await response.text();
        console.log('Raw response:', text);
        throw new Error(`Failed to add flashcard (status: ${response.status}): ${text}`);
      }

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.log('Non-JSON response:', text);
        throw new Error(`Expected JSON, got ${contentType}: ${text.slice(0, 100)}...`);
      }

      const data = await response.json();
      setFlashcards([data, ...flashcards]);
      setNewQuestion('');
      setNewAnswer('');
      pickRandomFlashcard();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add flashcard';
      setError(errorMessage);
      console.error('Add flashcard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update a flashcard
  const updateFlashcard = async (id: string, question: string, answer: string) => {
    if (!question.trim() || !answer.trim()) {
      setError('Question and answer cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flashcard/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), answer: answer.trim() }),
      });

      console.log('Update response status:', response.status);
      console.log('Update response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const text = await response.text();
        console.log('Update raw response:', text);
        throw new Error(`Failed to update flashcard (status: ${response.status}): ${text}`);
      }

      const updatedFlashcard = await response.json();
      setFlashcards(flashcards.map((fc) => (fc.id === id ? updatedFlashcard : fc)));
      setEditingFlashcard(null);
      if (currentFlashcard?.id === id) {
        setCurrentFlashcard(updatedFlashcard);
        setShowAnswer(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update flashcard';
      setError(errorMessage);
      console.error('Update flashcard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a flashcard
  const deleteFlashcard = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flashcard/${id}`, { method: 'DELETE' });

      console.log('Delete response status:', response.status);
      console.log('Delete response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const text = await response.text();
        console.log('Delete raw response:', text);
        throw new Error(`Failed to delete flashcard (status: ${response.status}): ${text}`);
      }

      setFlashcards(flashcards.filter((fc) => fc.id !== id));
      if (currentFlashcard?.id === id) {
        pickRandomFlashcard();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete flashcard';
      setError(errorMessage);
      console.error('Delete flashcard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start editing a flashcard
  const startEditing = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setError(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingFlashcard(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Flashcard App</h1>

      {/* Statistics */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-lg font-semibold text-gray-800">
          Stats: Correct: {stats.correct}, Incorrect: {stats.incorrect}, Total: {stats.correct + stats.incorrect}, Correct %: {calculateCorrectPercentage()}
        </p>
      </div>

      {/* Current Flashcard Display */}
      <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
        {currentFlashcard ? (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Question: {currentFlashcard.question}
            </h2>
            {showAnswer && (
              <p className="text-gray-600 mb-4">Answer: {currentFlashcard.answer}</p>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                disabled={loading}
              >
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </button>
              {showAnswer && (
                <>
                  <button
                    onClick={handleCorrect}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                    disabled={loading}
                  >
                    Correct
                  </button>
                  <button
                    onClick={handleIncorrect}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                    disabled={loading}
                  >
                    Incorrect
                  </button>
                </>
              )}
            </div>
            <button
              onClick={pickRandomFlashcard}
              className="w-full mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
              disabled={loading}
            >
              Next Flashcard
            </button>
          </>
        ) : (
          <p className="text-gray-600 text-center">No flashcards available. Add one below!</p>
        )}
      </div>

      {/* Add Flashcard Form */}
      <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Flashcard</h2>
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Enter question"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          disabled={loading}
        />
        <input
          type="text"
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Enter answer"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          disabled={loading}
        />
        <button
          onClick={addFlashcard}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? 'Adding...' : 'Add Flashcard'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6 text-center font-medium">
          {error}
        </p>
      )}

      {/* Flashcards List */}
      <div>
        {loading && <p className="text-gray-600 text-center">Updating...</p>}
        {flashcards.length === 0 && !loading && (
          <p className="text-gray-600 text-center">No flashcards available.</p>
        )}
        <ul className="space-y-4">
          {flashcards.map((flashcard) => (
            <li
              key={flashcard.id}
              className="p-6 bg-white shadow-md rounded-lg flex justify-between items-start hover:shadow-lg transition duration-200"
            >
              {editingFlashcard?.id === flashcard.id ? (
                <div className="w-full">
                  <input
                    type="text"
                    value={editingFlashcard.question}
                    onChange={(e) => setEditingFlashcard({ ...editingFlashcard, question: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    value={editingFlashcard.answer}
                    onChange={(e) => setEditingFlashcard({ ...editingFlashcard, answer: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    disabled={loading}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateFlashcard(flashcard.id, editingFlashcard.question, editingFlashcard.answer)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-gray-800"><strong>Q:</strong> {flashcard.question}</p>
                    <p className="text-gray-600"><strong>A:</strong> {flashcard.answer}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(flashcard.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(flashcard)}
                      disabled={loading}
                      className="px-4 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteFlashcard(flashcard.id)}
                      disabled={loading}
                      className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
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
    </div>
  );
}