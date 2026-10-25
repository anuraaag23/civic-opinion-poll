'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { INDIAN_STATES } from '@/lib/data/parties';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import {
  REALISTIC_INDIA_STATES,
  INDIA_MAP_VIEWBOX,
  StateGeoFeature,
} from '@/lib/data/indiaMapPaths';
import {
  MapPin,
  Vote,
  ArrowRight,
  Search,
  TrendingUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface IndiaMapProps {
  onSelectState?: (stateId: string) => void;
  selectedStateId?: string;
  className?: string;
  showLinkToCM?: boolean;
}

export function IndiaMap({
  onSelectState,
  selectedStateId = 'uttar-pradesh',
  className = '',
  showLinkToCM = true,
}: IndiaMapProps) {
  const { language } = useI18n();
  const [activeStateId, setActiveStateId] = useState<string>(selectedStateId);
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Sync state if controlled from outside
  React.useEffect(() => {
    if (selectedStateId) {
      setActiveStateId(selectedStateId);
    }
  }, [selectedStateId]);

  const activeState = useMemo(() => {
    return (
      REALISTIC_INDIA_STATES.find((s) => s.id === activeStateId) ||
      REALISTIC_INDIA_STATES.find((s) => s.id === 'uttar-pradesh') ||
      REALISTIC_INDIA_STATES[0]
    );
  }, [activeStateId]);

  const hoveredState = useMemo(() => {
    if (!hoveredStateId) return null;
    return REALISTIC_INDIA_STATES.find((s) => s.id === hoveredStateId) || null;
  }, [hoveredStateId]);

  const rawStateDetails = useMemo(() => {
    return INDIAN_STATES.find((s) => s.id === activeState.id);
  }, [activeState.id]);

  const handleStateClick = (stateId: string) => {
    setActiveStateId(stateId);
    if (onSelectState) {
      onSelectState(stateId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent, stateId: string) => {
    setHoveredStateId(stateId);
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredStateId(null);
    setTooltipPos(null);
  };

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return REALISTIC_INDIA_STATES.filter(
      (s) =>
        s.nameEn.toLowerCase().includes(q) ||
        s.nameHi.includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search & Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'hi' ? 'उच्च-परिशुद्धता भारत नक्शा' : 'High-Precision Vector Map of India'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {language === 'hi'
              ? 'राज्यवार जनमत एवं रुझान नक्शा'
              : 'Geographic State-by-State Opinion Explorer'}
          </h2>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'राज्य खोजें (उदा. UP, Bihar)...' : 'Find state (UP, Bihar)...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
          />
          {filteredStates.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 p-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] shadow-2xl max-h-56 overflow-y-auto space-y-1 backdrop-blur-xl">
              {filteredStates.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    handleStateClick(s.id);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="font-semibold text-[var(--text-primary)]">
                    {language === 'hi' ? s.nameHi : s.nameEn}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)] font-bold">{s.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Realistic SVG Map on Left, Active State Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Map Container */}
        <GlassCard elevated className="lg:col-span-7 p-3 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs text-[var(--text-tertiary)] mb-2 px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{language === 'hi' ? 'राज्य पर क्लिक या टैप करें' : 'Click or tap any state boundary'}</span>
            </span>
            <span className="text-[11px] font-mono font-semibold">
              {REALISTIC_INDIA_STATES.length} States & Territories
            </span>
          </div>

          {/* Interactive SVG Container */}
          <div
            ref={mapContainerRef}
            className="w-full max-w-[560px] aspect-[612/696] relative flex items-center justify-center select-none"
            onMouseLeave={handleMouseLeave}
          >
            {/* Floating Hover Tooltip */}
            {hoveredState && tooltipPos && (
              <div
                className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-[120%] px-3 py-1.5 rounded-xl bg-slate-900/95 text-white border border-cyan-500/30 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs animate-in fade-in zoom-in-95 duration-150"
                style={{
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y}px`,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: hoveredState.leadingPartyColor }}
                />
                <span className="font-bold">
                  {language === 'hi' ? hoveredState.nameHi : hoveredState.nameEn}
                </span>
                <span className="font-mono text-[11px] font-black text-amber-300">
                  {hoveredState.projectedShare}%
                </span>
              </div>
            )}

            <svg
              viewBox={INDIA_MAP_VIEWBOX}
              className="w-full h-full drop-shadow-lg select-none transition-all duration-300"
              style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.18))' }}
            >
              {/* Glow Filter for Active Selection */}
              <defs>
                <filter id="active-state-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38BDF8" floodOpacity="0.75" />
                </filter>
              </defs>

              {/* State Shapes - Realistic Topo Geometries */}
              {REALISTIC_INDIA_STATES.map((state) => {
                const isSelected = activeState.id === state.id;
                const isHovered = hoveredStateId === state.id;

                let fill = 'var(--bg-surface)';
                let fillOpacity = 0.45;
                let stroke = 'var(--border-glass)';
                let strokeWidth = 1.1;

                if (isSelected) {
                  fill = state.leadingPartyColor;
                  fillOpacity = 0.9;
                  stroke = '#38BDF8';
                  strokeWidth = 2.4;
                } else if (isHovered) {
                  fill = state.leadingPartyColor;
                  fillOpacity = 0.65;
                  stroke = '#FFFFFF';
                  strokeWidth = 1.8;
                }

                return (
                  <path
                    key={state.svgMapId}
                    id={`state-${state.svgMapId}`}
                    d={state.path}
                    fill={fill}
                    fillOpacity={fillOpacity}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    className="cursor-pointer transition-all duration-150"
                    style={
                      isSelected
                        ? { filter: 'url(#active-state-glow)' }
                        : undefined
                    }
                    onClick={() => handleStateClick(state.id)}
                    onMouseMove={(e) => handleMouseMove(e, state.id)}
                  />
                );
              })}

              {/* State Code Labels on Major Landmasses */}
              {REALISTIC_INDIA_STATES.map((state) => {
                if (!state.labelPos) return null;
                const isSelected = activeState.id === state.id;

                return (
                  <text
                    key={`label-${state.svgMapId}`}
                    x={state.labelPos.cx}
                    y={state.labelPos.cy}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize={isSelected ? '12' : '10'}
                    fontWeight="800"
                    fill={isSelected ? '#FFFFFF' : 'var(--text-secondary)'}
                    className="pointer-events-none select-none font-mono"
                    style={{
                      textShadow: isSelected
                        ? '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)'
                        : '0 1px 2px rgba(0,0,0,0.7)',
                    }}
                  >
                    {state.code}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Map Color Legend */}
          <div className="w-full pt-4 mt-3 border-t border-[var(--border-glass)] flex items-center justify-center gap-4 flex-wrap text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#FF9933] shadow-sm" />
              <span className="font-semibold text-[11px]">BJP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#0EA5E9] shadow-sm" />
              <span className="font-semibold text-[11px]">INC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#F59E0B] shadow-sm" />
              <span className="font-semibold text-[11px]">AAP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#16A34A] shadow-sm" />
              <span className="font-semibold text-[11px]">SP / RJD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#059669] shadow-sm" />
              <span className="font-semibold text-[11px]">TMC / JMM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#EF4444] shadow-sm" />
              <span className="font-semibold text-[11px]">DMK / CPIM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#EAB308] shadow-sm" />
              <span className="font-semibold text-[11px]">TDP</span>
            </div>
          </div>
        </GlassCard>

        {/* Selected State Detail Card */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard elevated className="p-6 space-y-5 animate-in fade-in duration-200">
            {/* State Name & Code */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border-glass)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] font-mono block">
                  State Assembly Jurisdiction
                </span>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">
                  {language === 'hi' ? activeState.nameHi : activeState.nameEn}
                </h3>
                <span className="text-xs text-[var(--text-tertiary)] font-mono">
                  State Code: {activeState.code} • Republic of India
                </span>
              </div>

              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-white text-base shadow-lg transition-colors"
                style={{ backgroundColor: activeState.leadingPartyColor }}
              >
                {activeState.code}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
                <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold block">
                  {language === 'hi' ? 'विधानसभा सीटें' : 'Assembly Seats'}
                </span>
                <span className="text-xl font-black text-[var(--text-primary)] font-mono">
                  {rawStateDetails?.assemblySeats || 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
                <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold block">
                  {language === 'hi' ? 'प्रक्षेपित मत प्रतिशत' : 'Projected Share'}
                </span>
                <span className="text-xl font-black text-emerald-500 font-mono">
                  {activeState.projectedShare}%
                </span>
              </div>
            </div>

            {/* Leading Choice Spotlight */}
            <div className="p-4 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--accent)] uppercase tracking-wider text-[10px]">
                  {language === 'hi' ? 'सर्वेक्षण में अग्रणी दल' : 'Projected Leading Front'}
                </span>
                <GlassBadge variant="success">
                  <TrendingUp className="w-3 h-3" />
                  <span>Rank #1</span>
                </GlassBadge>
              </div>

              <div className="flex items-center gap-3 pt-0.5">
                <div
                  className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: activeState.leadingPartyColor }}
                />
                <div>
                  <span className="text-sm font-black text-[var(--text-primary)] block">
                    {language === 'hi'
                      ? activeState.leadingCandidateHi
                      : activeState.leadingCandidateEn}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    {activeState.defaultLeadingParty.replace('party-', '').toUpperCase()} Front
                  </span>
                </div>
              </div>
            </div>

            {/* CTA: Go to State CM Poll */}
            {showLinkToCM && (
              <div className="pt-2">
                <Link
                  href={`/cm`}
                  onClick={() => onSelectState && onSelectState(activeState.id)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
                >
                  <Vote className="w-4 h-4" />
                  <span>
                    {language === 'hi'
                      ? `${activeState.nameHi} CM जनमत में वोट दें`
                      : `Vote in ${activeState.nameEn} CM Poll`}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </GlassCard>

          {/* Quick State Jump Pills Strip */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
              {language === 'hi' ? 'त्वरित प्रमुख राज्य चयन' : 'Quick Jump to Major State:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'uttar-pradesh',
                'maharashtra',
                'bihar',
                'west-bengal',
                'tamil-nadu',
                'delhi',
                'gujarat',
                'rajasthan',
                'karnataka',
                'madhya-pradesh',
              ].map((stId) => {
                const st = REALISTIC_INDIA_STATES.find((s) => s.id === stId);
                if (!st) return null;
                const isSelected = activeState.id === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStateClick(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent)] text-white shadow-md'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-glass)]'
                    }`}
                  >
                    {language === 'hi' ? st.nameHi : st.nameEn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
