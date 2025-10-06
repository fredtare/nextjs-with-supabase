'use client';

import { useState } from 'react';

interface Todo {
  id: string;
  task: string;
  is_completed: boolean;
  created_at: string;
}

interface TodosClientProps {
  initialTodos: Todo[];
}

export default function TodosClient({ initialTodos }: TodosClientProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add a new todo
  const addTodo = async () => {
    if (!newTodo.trim()) {
      setError('Todo cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTodo.trim() }),
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
        throw new Error(data?.error || `Failed to add todo (status: ${response.status})`);
      }

      setNewTodo('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add todo';
      setError(errorMessage);
      console.error('Add todo error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a todo
  const deleteTodo = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete todo');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    } finally {
      setLoading(false);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id: string, is_completed: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: !is_completed }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update todo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Add Todo Form */}
      <div className="mb-8 bg-white shadow-lg rounded-lg p-6">
        <input
          id="new-todo"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          disabled={loading}
        />
        <button
          onClick={addTodo}
          disabled={loading}
          className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {loading ? 'Adding...' : 'Add Todo'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6 text-center font-medium">
          {error}
        </p>
      )}

      {/* Todos List */}
      <div>
        {loading && (
          <p className="text-gray-600 text-center">Updating...</p>
        )}
        {todos.length === 0 && !loading && (
          <p className="text-gray-600 text-center">No todos available.</p>
        )}
        <ul className="space-y-4">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="p-6 bg-white shadow-md rounded-lg flex justify-between items-center hover:shadow-lg transition duration-200"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={todo.is_completed}
                  onChange={() => toggleTodo(todo.id, todo.is_completed)}
                  disabled={loading}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <p className={`text-gray-800 ${todo.is_completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.task}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(todo.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
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