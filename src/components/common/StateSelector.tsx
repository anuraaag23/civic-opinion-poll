'use client';

import React, { useState, useMemo } from 'react';
import { INDIAN_STATES, IndianState } from '@/lib/data/parties';
import { useI18n } from '@/lib/i18n/context';
import { Search, MapPin, Check, ChevronDown } from 'lucide-react';

interface StateSelectorProps {
  selectedStateId: string;
  onSelectState: (stateId: string) => void;
  className?: string;
  compact?: boolean;
}

export function StateSelector({
  selectedStateId,
  onSelectState,
  className = '',
  compact = false,
}: StateSelectorProps) {
  const { language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentState = useMemo(() => {
    return (
      INDIAN_STATES.find((s) => s.id === selectedStateId) ||
      INDIAN_STATES.find((s) => s.id === 'uttar-pradesh') ||
      INDIAN_STATES[0]
    );
  }, [selectedStateId]);

  const filteredStates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return INDIAN_STATES;
    return INDIAN_STATES.filter(
      (s) =>
        s.name_en.toLowerCase().includes(q) ||
        s.name_hi.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const quickStates = useMemo(() => {
    return ['uttar-pradesh', 'maharashtra', 'bihar', 'west-bengal', 'tamil-nadu', 'delhi', 'andhra-pradesh', 'telangana', 'karnataka', 'punjab', 'rajasthan', 'gujarat']
      .map((id) => INDIAN_STATES.find((s) => s.id === id))
      .filter((s): s is IndianState => Boolean(s));
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current Selection Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full relative overflow-hidden rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[var(--accent)] bg-white/70 dark:bg-[#121620]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)] hover:border-[var(--accent)]/50 active:scale-[0.99]"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {/* Top specular highlight rim */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-blue-400/30 to-transparent pointer-events-none" />

          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/15 via-blue-600/10 to-indigo-600/20 text-[var(--accent)] flex items-center justify-center font-black text-sm shrink-0 border border-blue-500/25 shadow-xs">
              {currentState.code}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider block mb-0.5">
                {language === 'hi' ? 'चयनित राज्य / केंद्र शासित प्रदेश' : 'Selected State / Union Territory'}
              </span>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate leading-tight">
                  {language === 'hi' ? currentState.name_hi : currentState.name_en}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-flex items-center text-xs font-semibold text-[var(--accent)] px-2.5 py-1 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20">
                    {language === 'hi' ? 'राज्य बदलें' : 'Change State'}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/[0.06] text-[var(--text-secondary)] transition-transform duration-200 border border-black/5 dark:border-white/5 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-medium block mt-0.5">
                {currentState.assemblySeats
                  ? language === 'hi'
                    ? `विधानसभा सीटें: ${currentState.assemblySeats}`
                    : `Assembly Seats: ${currentState.assemblySeats}`
                  : currentState.type}
              </span>
            </div>
          </div>
        </button>

        {/* Dropdown Popover - 100% Solid Opaque Background to prevent double-exposure */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--bg-surface)] dark:bg-[#131720] backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-[var(--border-glass)] space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[380px] flex flex-col w-full max-w-full overflow-hidden">
              {/* Search Field */}
              <div className="relative shrink-0">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder={
                    language === 'hi'
                      ? 'राज्य का नाम खोजें (उदा. उत्तर प्रदेश, बिहार)...'
                      : 'Search state by name or code (e.g. UP, Bihar, Delhi)...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-glass)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  autoFocus
                />
              </div>

              {/* State List Scroll Container with Opaque Surface */}
              <div
                className="overflow-y-auto overscroll-contain space-y-1.5 pr-1 flex-1 max-h-[280px] custom-scrollbar"
                role="listbox"
                tabIndex={0}
                aria-label="Indian States and Union Territories list"
              >
                {filteredStates.map((st) => {
                  const isSelected = st.id === selectedStateId;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSelectState(st.id);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full p-2.5 sm:p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold border border-[var(--accent)]/30'
                          : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-[var(--border-glass)] text-[var(--text-secondary)] text-xs font-black flex items-center justify-center shrink-0">
                          {st.code}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                              {language === 'hi' ? st.name_hi : st.name_en}
                            </span>
                            <span className="text-xs text-[var(--text-secondary)] font-medium">
                              • {language === 'hi' ? st.name_en : st.name_hi}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--text-tertiary)] font-normal block mt-0.5">
                            {st.assemblySeats
                              ? `${st.assemblySeats} ${language === 'hi' ? 'विधानसभा सीटें' : 'Assembly Seats'}`
                              : st.type}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}

                {filteredStates.length === 0 && (
                  <div className="p-6 text-center text-xs text-[var(--text-secondary)]">
                    {language === 'hi' ? 'कोई राज्य नहीं मिला' : 'No state found matching your query.'}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* iOS 27 Vision Glass Quick Select Pill Strip */}
      {!compact && (
        <div className="relative pt-1">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-1 px-1">
            <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-xs backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {language === 'hi' ? 'त्वरित चयन:' : 'Quick Select:'}
              </span>
            </div>

            {quickStates.map((st) => {
              const isActive = st.id === selectedStateId;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectState(st.id)}
                  className={`group relative shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-bold shadow-[0_2px_12px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.45)] border border-blue-400/50'
                      : 'bg-white/70 dark:bg-[#141822]/90 hover:bg-white dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs backdrop-blur-md font-medium'
                  }`}
                  aria-pressed={isActive}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] shrink-0" />
                  )}
                  <span>{language === 'hi' ? st.name_hi : st.name_en}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
