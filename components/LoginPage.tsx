import React, { useState } from 'react';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (userType: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', data.user);
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Incorrect password');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 flex items-center justify-center font-sans relative overflow-hidden">
      {/* Background atmosphere effect matching main app */}
      <div className="absolute inset-0 atmosphere opacity-50 pointer-events-none" />
      
      <div className="w-full max-w-md p-8 glass-panel rounded-3xl border border-white/10 relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg shadow-indigo-500/20">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Veo Studio</h1>
          <p className="text-gray-500 text-xs mt-2 font-medium tracking-widest uppercase">Protected Workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Access Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in slide-in-from-top-2 duration-300">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Validating...
              </>
            ) : (
              'Enter Workspace'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-top border-white/5 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-tighter">
            Powered by Thamodag
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
