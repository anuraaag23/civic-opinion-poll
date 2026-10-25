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
  Sparkles,
  Award,
  Swords,
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

  // Projected margin calculation
  const margin = useMemo(() => {
    if (!activeState.runnerUp) return null;
    return (activeState.projectedShare - activeState.runnerUp.projectedShare).toFixed(1);
  }, [activeState]);

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
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {language === 'hi' ? s.nameHi : s.nameEn}
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                      (Rank #{s.nationalSeatRank})
                    </span>
                  </div>
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
                className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-[120%] px-3 py-2 rounded-xl bg-slate-900/95 text-white border border-cyan-500/30 shadow-2xl backdrop-blur-md flex flex-col gap-0.5 text-xs animate-in fade-in zoom-in-95 duration-150"
                style={{
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y}px`,
                }}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: hoveredState.leadingPartyColor }}
                  />
                  <span>{language === 'hi' ? hoveredState.nameHi : hoveredState.nameEn}</span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    (Rank #{hoveredState.nationalSeatRank})
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  {language === 'hi' ? 'अग्रणी:' : 'Lead:'} {hoveredState.leadingCandidateEn.split('/')[0].trim()} ({hoveredState.projectedShare}%)
                </div>
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
            {/* State Header & National Rank */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border-glass)] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-mono font-bold border border-[var(--accent)]/20 uppercase tracking-wider">
                    {language === 'hi'
                      ? `राष्ट्रीय विधानसभा रैंक #${activeState.nationalSeatRank}`
                      : `National Rank #${activeState.nationalSeatRank} by Seats`}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">
                  {language === 'hi' ? activeState.nameHi : activeState.nameEn}
                </h3>
                <span className="text-xs text-[var(--text-tertiary)] font-mono">
                  Code: {activeState.code} • {activeState.assemblySeats} Assembly Seats
                </span>
              </div>

              <div
                className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono text-white shadow-lg transition-colors shrink-0"
                style={{ backgroundColor: activeState.leadingPartyColor }}
              >
                <span className="text-base font-black leading-none">{activeState.code}</span>
                <span className="text-[9px] font-bold opacity-80 mt-0.5">#{activeState.nationalSeatRank}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
                <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold block">
                  {language === 'hi' ? 'विधानसभा सीटें' : 'Assembly Seats'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-[var(--text-primary)] font-mono">
                    {activeState.assemblySeats || 'N/A'}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                    (Rank #{activeState.nationalSeatRank})
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
                <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold block">
                  {language === 'hi' ? 'अग्रणी मत प्रतिशत' : 'Leader Vote Share'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-emerald-500 font-mono">
                    {activeState.projectedShare}%
                  </span>
                  {margin && (
                    <span className="text-[10px] font-bold text-emerald-500 font-mono">
                      (+{margin}%)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contest Spotlight: Front-Runner vs Challenger */}
            <div className="p-4 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-[var(--accent)]/20 pb-2">
                <span className="font-bold text-[var(--accent)] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'राज्य जनमत रुझान' : 'State CM Contest Projection'}
                </span>
                <span className="text-[10px] font-mono font-bold text-[var(--text-tertiary)]">
                  {language === 'hi' ? 'शीर्ष द्वंद' : 'Front-Runner vs Challenger'}
                </span>
              </div>

              {/* #1 Front-Runner */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: activeState.leadingPartyColor }}
                  />
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase font-mono">
                        #1 Lead
                      </span>
                      <span className="font-black text-[var(--text-primary)] truncate text-xs">
                        {language === 'hi' ? activeState.leadingCandidateHi : activeState.leadingCandidateEn}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                      {activeState.defaultLeadingParty.replace('party-', '').toUpperCase()} Front
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-[var(--text-primary)] font-mono block">
                    {activeState.projectedShare}%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 font-mono">
                    Projected Win
                  </span>
                </div>
              </div>

              {/* #2 Challenger / Runner-Up */}
              {activeState.runnerUp && (
                <div className="flex items-center justify-between gap-3 text-xs pt-1 border-t border-[var(--border-glass)]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: activeState.runnerUp.partyColor }}
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-500/20 text-[var(--text-secondary)] text-[9px] font-black uppercase font-mono">
                          #2 Challenger
                        </span>
                        <span className="font-bold text-[var(--text-secondary)] truncate text-xs">
                          {language === 'hi' ? activeState.runnerUp.candidateHi : activeState.runnerUp.candidateEn}
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
                        {activeState.runnerUp.party} Front
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[var(--text-secondary)] font-mono block">
                      {activeState.runnerUp.projectedShare}%
                    </span>
                    <span className="text-[10px] font-medium text-[var(--text-tertiary)] font-mono">
                      Runner-up
                    </span>
                  </div>
                </div>
              )}
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

          {/* Quick State Jump Pills Strip with National Ranks */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
              {language === 'hi' ? 'त्वरित प्रमुख राज्य चयन' : 'Quick Jump to Major State:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'uttar-pradesh',
                'west-bengal',
                'maharashtra',
                'bihar',
                'tamil-nadu',
                'madhya-pradesh',
                'karnataka',
                'rajasthan',
                'gujarat',
                'delhi',
              ].map((stId) => {
                const st = REALISTIC_INDIA_STATES.find((s) => s.id === stId);
                if (!st) return null;
                const isSelected = activeState.id === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStateClick(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[var(--accent)] text-white shadow-md'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-glass)]'
                    }`}
                  >
                    <span>{language === 'hi' ? st.nameHi : st.nameEn}</span>
                    <span
                      className={`text-[10px] font-mono px-1 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-black/10 text-[var(--text-tertiary)]'
                      }`}
                    >
                      #{st.nationalSeatRank}
                    </span>
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
