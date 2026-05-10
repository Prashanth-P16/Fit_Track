import { useState } from 'react';
import { Activity, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (result.error) {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Activity className="w-8 h-8 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">FitTrack</h1>
        </div>

        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
          <h2 className="text-lg font-medium text-white text-center mb-6">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-2 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-2.5">
                <Mail className="w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-2.5">
                <Lock className="w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-400 text-[#0a0a0f] text-sm font-medium rounded-xl hover:bg-emerald-300 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-[#0a0a0f] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
