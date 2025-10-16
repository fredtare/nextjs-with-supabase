'use client';

import { useState, useEffect } from 'react';

interface ServerStatus {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  version: string;
  description: string;
}

interface RegisterClientProps {
  initialToken?: string;
}

export default function RegisterClient({ initialToken = '' }: RegisterClientProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState(initialToken);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>({ status: 'UNKNOWN', version: '', description: '' });

  // Fetch server status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('https://api.spacetraders.io/v2');
        console.log('Server status response:', response.status);
        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }
        const data = await response.json();
        setServerStatus({
          status: data.status as 'UP' | 'DOWN' | 'UNKNOWN',
          version: data.version || '',
          description: data.description || '',
        });
      } catch (err) {
        console.error('Server status error:', err);
        setServerStatus({ status: 'UNKNOWN', version: '', description: 'Could not fetch status' });
      }
    };

    fetchStatus();

    // Optional: Auto-refresh every 30 seconds
    // const interval = setInterval(fetchStatus, 30000);
    // return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }
    if (!username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), username: username.trim() }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to register (status: ${response.status})`);
      }

      const data = await response.json();
      setToken(data.token);
      setEmail('');
      setUsername('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ServerStatus['status']) => {
    switch (status) {
      case 'UP': return 'bg-green-100 text-green-800 border-green-300';
      case 'DOWN': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Server Status Badge */}
      <div className="mb-4 p-2 border rounded-md text-sm">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(serverStatus.status)}`}>
          Server Status: {serverStatus.status}
        </span>
        {serverStatus.version && (
          <p className="mt-1 text-xs text-gray-600">Version: {serverStatus.version}</p>
        )}
        {serverStatus.description && (
          <p className="mt-1 text-xs text-gray-600">{serverStatus.description}</p>
        )}
      </div>

      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Register for SpaceTraders.io</h1>
      <p className="text-gray-600 text-center mb-4">
        Enter your email and username to create an account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || serverStatus.status === 'DOWN'}
          className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {error && (
        <p className="mt-4 p-2 bg-red-100 text-red-700 rounded-md text-center">{error}</p>
      )}

      {token && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
          <p className="font-semibold">Success! Your API Token:</p>
          <p className="break-all">{token}</p>
          <p className="text-sm mt-2">
            Save this token securely! You'll need it for API calls.
          </p>
          <a
            href="https://api.spacetraders.io/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Go to Dashboard
          </a>
        </div>
      )}
    </div>
  );
}