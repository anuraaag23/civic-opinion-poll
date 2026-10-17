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
          className="w-full glass-panel p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 text-left border-2 border-[var(--accent)]/40 hover:border-[var(--accent)] transition-all cursor-pointer shadow-sm group focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-black text-sm shrink-0 border border-[var(--accent)]/30">
              {currentState.code}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[var(--accent)] block mb-0.5">
                {language === 'hi' ? 'चयनित राज्य / केंद्र शासित प्रदेश' : 'Selected State / Union Territory'}
              </span>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate leading-normal">
                  {language === 'hi' ? currentState.name_hi : currentState.name_en}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-flex items-center text-xs font-semibold text-[var(--accent)] px-2.5 py-1 rounded-full bg-[var(--accent-soft)]">
                    {language === 'hi' ? 'राज्य बदलें' : 'Change State'}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-medium block">
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
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--bg-surface)] p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-[var(--border-glass)] space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[380px] flex flex-col w-full max-w-full overflow-hidden">
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

      {/* Quick Select Buttons below trigger when not compact */}
      {!compact && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-[var(--text-tertiary)] font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
            {language === 'hi' ? 'त्वरित चयन:' : 'Quick Select:'}
          </span>
          {quickStates.slice(0, 6).map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectState(st.id)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer active:scale-95 ${
                st.id === selectedStateId
                  ? 'bg-[var(--accent)] text-white font-bold shadow-xs'
                  : 'bg-[var(--bg-surface)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-[var(--text-secondary)] border border-[var(--border-glass)] font-medium'
              }`}
            >
              {language === 'hi' ? st.name_hi : st.name_en}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
