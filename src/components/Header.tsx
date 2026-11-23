import React from 'react';
import { LanguageCode, Translations } from '../data/i18n';

export interface UserProfile {
  name: string;
  email: string;
}

interface HeaderProps {
  lang: LanguageCode;
  onToggleLanguage: () => void;
  user: UserProfile | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  t: Translations;
}

function FlagIcon({ lang }: { lang: LanguageCode }) {
  if (lang === 'PT') {
    return (
      <svg viewBox="0 0 24 16" className="w-[20px] h-[14px] rounded-[2px] shrink-0" aria-hidden="true">
        <rect width="24" height="16" fill="#009c3b" />
        <polygon points="12,2 21,8 12,14 3,8" fill="#ffdf00" />
        <circle cx="12" cy="8" r="3.4" fill="#002776" />
        <path d="M9.1 7.6 Q12 6.8 14.9 8.2" stroke="#ffffff" strokeWidth="0.7" fill="none" />
      </svg>
    );
  }
  if (lang === 'EN') {
    return (
      <svg viewBox="0 0 24 16" className="w-[20px] h-[14px] rounded-[2px] shrink-0" aria-hidden="true">
        <rect width="24" height="16" fill="#b22234" />
        <rect y="2" width="24" height="2" fill="#ffffff" />
        <rect y="6" width="24" height="2" fill="#ffffff" />
        <rect y="10" width="24" height="2" fill="#ffffff" />
        <rect y="14" width="24" height="2" fill="#ffffff" />
        <rect width="11" height="9" fill="#3c3b6e" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 16" className="w-[20px] h-[14px] rounded-[2px] shrink-0" aria-hidden="true">
      <rect width="24" height="16" fill="#aa151b" />
      <rect y="4" width="24" height="8" fill="#f1bf00" />
    </svg>
  );
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLanguage,
  user,
  onOpenAuth,
  onLogout,
  t,
}) => {
  return (
    <div className="w-full">
      {/* Main Top Bar */}
      <header className="w-full bg-[#0d0d0d] px-4 py-3 flex items-center justify-between gap-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-3.5">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={onToggleLanguage}
            aria-label={`Idioma: ${lang}`}
            className="min-h-[40px] bg-[#161616] hover:bg-[#1f1f1f] active:scale-[0.97] border border-[#2c2c2c] rounded-[7px] px-3 py-1.5 flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <FlagIcon lang={lang} />
            <span className="text-white text-[13px] font-extrabold tracking-wide leading-none">
              {lang}
            </span>
          </button>

          {/* VildDrump Brand Mark with 4-beat step underline */}
          <div className="flex flex-col items-stretch select-none">
            <span className="text-[24px] leading-none font-extrabold tracking-[-0.03em] text-white">
              VildDrump
            </span>
            <div className="grid grid-cols-4 gap-[3px] mt-[4px]" aria-hidden="true">
              <span className="h-[3px] bg-[#f5a623] rounded-[1px]" />
              <span className="h-[3px] bg-[#e5e5e5] rounded-[1px]" />
              <span className="h-[3px] bg-[#e5e5e5] rounded-[1px]" />
              <span className="h-[3px] bg-[#e5e5e5] rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Right Primary CTA */}
        {user ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#d4d4d4] max-w-[110px] truncate hidden sm:inline">
              {user.name}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="min-h-[40px] bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#3a3a3a] text-[#e5e5e5] text-[12px] font-extrabold tracking-wider px-4 py-2 rounded-[7px] transition-colors cursor-pointer uppercase whitespace-nowrap"
            >
              {t.logout}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="min-h-[40px] bg-[#f5a623] hover:bg-[#e59815] active:scale-[0.97] text-[#111111] text-[13px] font-extrabold tracking-wider px-5 py-2 rounded-[7px] transition-all cursor-pointer uppercase whitespace-nowrap shrink-0"
          >
            {t.login}
          </button>
        )}
      </header>

      {/* Registration Promo Sub-banner */}
      <div className="w-full bg-[#141414] border-y border-[#222222]">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 text-[13px] text-[#d4d4d4] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#f5a623] shrink-0" aria-hidden="true" />
              <span>{t.promoUnlocked}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#242424] shrink-0" aria-hidden="true" />
                <p className="text-[13px] text-[#a3a3a3] font-semibold truncate">
                  {t.promoBanner}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="bg-white hover:bg-[#ececec] active:scale-[0.97] text-[#111111] text-[13px] font-extrabold px-4 py-1.5 rounded-[7px] transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {t.registerBtn}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
