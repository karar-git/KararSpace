import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Portfolio Admin</h1>
          <p className="text-zinc-500">Manage your portfolio content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600 transition"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600 transition"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600 transition"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-sm text-zinc-500 hover:text-white transition"
          >
            {isRegister ? 'Already have an account? Sign in' : 'First time? Create an account'}
          </button>
        </form>
      </div>
    </div>
  );
}
