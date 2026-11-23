import React, { useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { RhythmDefinition } from '../data/rhythms';
import { Translations } from '../data/i18n';

interface RhythmCatalogModalProps {
  isOpen: boolean;
  rhythms: RhythmDefinition[];
  activeRhythmId: string;
  onSelectRhythm: (rhythm: RhythmDefinition) => void;
  onClose: () => void;
  t: Translations;
}

export const RhythmCatalogModal: React.FC<RhythmCatalogModalProps> = ({
  isOpen,
  rhythms,
  activeRhythmId,
  onSelectRhythm,
  onClose,
  t,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(rhythms.map((r) => r.category)));
    return ['ALL', ...unique];
  }, [rhythms]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rhythms.filter((r) => {
      const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory;
      const matchesQuery =
        !q || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [rhythms, query, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.catalogTitle}
    >
      <div
        className="w-full sm:max-w-lg bg-[#141414] border border-[#2c2c2c] rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#242424] flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white tracking-tight">
            {t.catalogTitle}
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

        {/* Search & Category Tabs */}
        <div className="px-5 pt-3.5 pb-2 space-y-3 border-b border-[#222222]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.catalogSearchPlaceholder}
              className="w-full bg-[#1b1b1b] border border-[#2e2e2e] focus:border-[#f5a623] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#737373] outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    active
                      ? 'bg-[#f5a623] text-[#111111]'
                      : 'bg-[#1c1c1c] text-[#a3a3a3] hover:text-white border border-[#2a2a2a]'
                  }`}
                >
                  {cat === 'ALL' ? t.allCategories : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rhythm List */}
        <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
          {filtered.map((rhythm) => {
            const isActive = rhythm.id === activeRhythmId;
            return (
              <button
                key={rhythm.id}
                type="button"
                onClick={() => {
                  onSelectRhythm(rhythm);
                  onClose();
                }}
                className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#201d17] border-[#f5a623] text-white'
                    : 'bg-[#191919] hover:bg-[#222222] border-[#262626] text-[#e5e5e5]'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{rhythm.name}</div>
                  <div className="text-xs text-[#888888] mt-0.5 flex items-center gap-2">
                    <span>{rhythm.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{rhythm.defaultBpm} BPM</span>
                  </div>
                </div>
                {isActive && (
                  <span className="flex items-center gap-1 text-xs font-extrabold text-[#f5a623] shrink-0 ml-2">
                    <Check className="w-4 h-4" />
                    {t.selectedLabel}
                  </span>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-[#737373]">
              Nenhum ritmo encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
