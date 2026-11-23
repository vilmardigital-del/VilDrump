import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Translations } from '../data/i18n';
import { UserProfile } from './Header';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  t: Translations;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
  t,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Informe seu nome.');
      return;
    }
    const resolvedName =
      mode === 'register' ? name.trim() : email.split('@')[0] || 'Músico';
    onSuccess({ name: resolvedName, email: email.trim() });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'login' ? t.authLoginTitle : t.authRegisterTitle}
    >
      <div
        className="w-full max-w-sm bg-[#141414] border border-[#2c2c2c] rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#242424] flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white">
            {mode === 'login' ? t.authLoginTitle : t.authRegisterTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-9 h-9 rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] flex items-center justify-center text-[#a3a3a3] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[#a3a3a3] mb-1.5">
                {t.authNameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-[#1b1b1b] border border-[#2e2e2e] focus:border-[#f5a623] rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#a3a3a3] mb-1.5">
              {t.authEmailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="w-full bg-[#1b1b1b] border border-[#2e2e2e] focus:border-[#f5a623] rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#a3a3a3] mb-1.5">
              {t.authPasswordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1b1b1b] border border-[#2e2e2e] focus:border-[#f5a623] rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
            />
          </div>

          {error && <p className="text-xs font-semibold text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#f5a623] hover:bg-[#e59815] text-[#111111] font-extrabold text-sm cursor-pointer transition-colors"
          >
            {mode === 'login' ? t.authSubmitLogin : t.authSubmitRegister}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="w-full py-1.5 text-xs font-semibold text-[#a3a3a3] hover:text-white cursor-pointer"
          >
            {mode === 'login' ? t.authSwitchToRegister : t.authSwitchToLogin}
          </button>
        </form>
      </div>
    </div>
  );
};
