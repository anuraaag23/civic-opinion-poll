'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { INDIAN_STATES, IndianState, OFFICIAL_PARTIES, Party } from '@/lib/data/parties';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassBadge } from '@/components/ui/GlassBadge';
import {
  MapPin,
  Vote,
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface IndiaMapProps {
  onSelectState?: (stateId: string) => void;
  selectedStateId?: string;
  className?: string;
  showLinkToCM?: boolean;
}

// Stylized geographical layout coordinates and representative paths for Indian States & UTs
interface StateGeoPath {
  id: string;
  code: string;
  nameEn: string;
  nameHi: string;
  cx: number;
  cy: number;
  path: string;
  defaultLeadingParty: string; // party ID
  leadingPartyColor: string;
  leadingCandidateEn: string;
  leadingCandidateHi: string;
  projectedShare: number;
}

const STATE_GEO_DATA: StateGeoPath[] = [
  // North
  {
    id: 'jammu-kashmir',
    code: 'JK',
    nameEn: 'Jammu & Kashmir',
    nameHi: 'जम्मू और कश्मीर',
    cx: 250,
    cy: 110,
    path: 'M 210,65 L 280,65 L 295,110 L 255,145 L 205,125 Z',
    defaultLeadingParty: 'party-nc',
    leadingPartyColor: '#DC2626',
    leadingCandidateEn: 'Omar Abdullah',
    leadingCandidateHi: 'उमर अब्दुल्ला',
    projectedShare: 43.5,
  },
  {
    id: 'himachal-pradesh',
    code: 'HP',
    nameEn: 'Himachal Pradesh',
    nameHi: 'हिमाचल प्रदेश',
    cx: 275,
    cy: 165,
    path: 'M 255,145 L 295,140 L 305,185 L 260,195 L 250,165 Z',
    defaultLeadingParty: 'party-inc',
    leadingPartyColor: '#0EA5E9',
    leadingCandidateEn: 'Sukhvinder Sukhu',
    leadingCandidateHi: 'सुखविंदर सिंह सुक्खू',
    projectedShare: 47.8,
  },
  {
    id: 'punjab',
    code: 'PB',
    nameEn: 'Punjab',
    nameHi: 'पंजाब',
    cx: 220,
    cy: 185,
    path: 'M 205,160 L 248,155 L 245,215 L 195,210 Z',
    defaultLeadingParty: 'party-aap',
    leadingPartyColor: '#F59E0B',
    leadingCandidateEn: 'Bhagwant Mann',
    leadingCandidateHi: 'भगवंत मान',
    projectedShare: 52.4,
  },
  {
    id: 'uttarakhand',
    code: 'UK',
    nameEn: 'Uttarakhand',
    nameHi: 'उत्तराखंड',
    cx: 320,
    cy: 200,
    path: 'M 295,180 L 345,185 L 340,230 L 295,220 Z',
    defaultLeadingParty: 'party-bjp',
    leadingPartyColor: '#FF9933',
    leadingCandidateEn: 'Pushkar Dhami',
    leadingCandidateHi: 'पुष्कर सिंह धामी',
    projectedShare: 54.1,
  },
  {
    id: 'haryana',
    code: 'HR',
    nameEn: 'Haryana',
    nameHi: 'हरियाणा',
    cx: 245,
    cy: 235,
    path: 'M 230,215 L 275,215 L 275,260 L 225,255 Z',
    defaultLeadingParty: 'party-bjp',
    leadingPartyColor: '#FF9933',
    leadingCandidateEn: 'Nayab Saini',
    leadingCandidateHi: 'नायब सिंह सैनी',
    projectedShare: 49.2,
  },
  {
    id: 'delhi',
    code: 'DL',
    nameEn: 'Delhi (NCT)',
    nameHi: 'दिल्ली (एनसीटी)',
    cx: 268,
    cy: 242,
    path: 'M 264,236 L 274,236 L 274,246 L 264,246 Z',
    defaultLeadingParty: 'party-aap',
    leadingPartyColor: '#F59E0B',
    leadingCandidateEn: 'Arvind Kejriwal / Atishi',
    leadingCandidateHi: 'अरविंद केजरीवाल / आतिशी',
    projectedShare: 54.8,
  },
  {
    id: 'rajasthan',
    code: 'RJ',
    nameEn: 'Rajasthan',
    nameHi: 'राजस्थान',
    cx: 175,
    cy: 285,
    path: 'M 140,225 L 225,230 L 245,300 L 195,355 L 125,310 Z',
    defaultLeadingParty: 'party-bjp',
    leadingPartyColor: '#FF9933',
    leadingCandidateEn: 'Bhajan Lal Sharma',
    leadingCandidateHi: 'भजन लाल शर्मा',
    projectedShare: 51.6,
  },
  {
    id: 'uttar-pradesh',
    code: 'UP',
    nameEn: 'Uttar Pradesh',
    nameHi: 'उत्तर प्रदेश',
    cx: 335,
    cy: 285,
    path: 'M 275,235 L 350,230 L 415,280 L 375,340 L 285,320 L 275,265 Z',
    defaultLeadingParty: 'party-bjp',
    leadingPartyColor: '#FF9933',
    leadingCandidateEn: 'Yogi Adityanath',
    leadingCandidateHi: 'योगी आदित्यनाथ',
    projectedShare: 53.7,
  },
  {
    id: 'bihar',
    code: 'BR',
    nameEn: 'Bihar',
    nameHi: 'बिहार',
    cx: 435,
    cy: 310,
    path: 'M 405,275 L 475,285 L 470,345 L 395,340 Z',
    defaultLeadingParty: 'party-rjd',
    leadingPartyColor: '#16A34A',
    leadingCandidateEn: 'Tejashwi Yadav',
    leadingCandidateHi: 'तेजस्वी यादव',
    projectedShare: 46.2,
  },
  {
    id: 'west-bengal',
    code: 'WB',
    nameEn: 'West Bengal',
    nameHi: 'पश्चिम बंगाल',
    cx: 485,
    cy: 360,
    path: 'M 470,300 L 510,310 L 515,405 L 465,415 L 465,345 Z',
    defaultLeadingParty: 'party-aitc',
    leadingPartyColor: '#059669',
    leadingCandidateEn: 'Mamata Banerjee',
    leadingCandidateHi: 'ममता बनर्जी',
    projectedShare: 50.9,
  },
  {
    id: 'jharkhand',
    code: 'JH',
    nameEn: 'Jharkhand',
    nameHi: 'झारखंड',
    cx: 430,
    cy: 365,
    path: 'M 400,345 L 465,345 L 460,405 L 395,395 Z',
    defaultLeadingParty: 'party-jmm',
    leadingPartyColor: '#047857',
    leadingCandidateEn: 'Hemant Soren',
    leadingCandidateHi: 'हेमंत सोरेन',
    projectedShare: 48.7,
  },
  {
    id: 'odisha',
    code: 'OD',
    nameEn: 'Odisha',
    nameHi: 'ओडिशा',
    cx: 425,
    cy: 440,
    path: 'M 405,400 L 465,405 L 450,480 L 380,470 L 390,415 Z',
    defaultLeadingParty: 'party-bjp',
    leadingPartyColor: '#FF9933',
    leadingCandidateEn: 'Mohan Charan Majhi',
    leadingCandidateHi: 'मोहन चरण माझी',
    projectedShare: 49.3,
  },
  {
    id: 'madhya-pradesh',
    code: 'MP',
    nameEn: 'Madhya Pradesh',
    nameHi: 'मध्य प्रदेश',
    cx: 290,
    cy: 370,
    path: 'M 245,310 L 375,325 L 370,410 L 235,405 L 225,355 Z',
    defaultLeadingParty: 'party-bjp',
    leadingPartyColor: '#FF9933',
    leadingCandidateEn: 'Mohan Yadav',
    leadingCandidateHi: 'मोहन यादव',
    projectedShare: 54.2,
  },
  {
    id: 'chhattisgarh',
    code: 'CG',
    nameEn: 'Chhattisgarh',
    nameHi: 'छत्तीसगढ़',
    cx: 375,
    cy: 415,
    path: 'M 355,360 L 395,360 L 390,475 L 340,460 Z',
    defaultLeadingParty: 'party-bjp',
    leadingPartyColor: '#FF9933',
    leadingCandidateEn: 'Vishnu Deo Sai',
    leadingCandidateHi: 'विष्णु देव साय',
    projectedShare: 52.0,
  },
  {
    id: 'gujarat',
    code: 'GJ',
    nameEn: 'Gujarat',
    nameHi: 'गुजरात',
    cx: 145,
    cy: 395,
    path: 'M 105,335 L 185,345 L 205,420 L 140,445 L 90,400 Z',
    defaultLeadingParty: 'party-bjp',
    leadingPartyColor: '#FF9933',
    leadingCandidateEn: 'Bhupendra Patel',
    leadingCandidateHi: 'भूपेंद्र पटेल',
    projectedShare: 61.4,
  },
  {
    id: 'maharashtra',
    code: 'MH',
    nameEn: 'Maharashtra',
    nameHi: 'महाराष्ट्र',
    cx: 235,
    cy: 485,
    path: 'M 175,430 L 305,420 L 320,510 L 225,540 L 165,495 Z',
    defaultLeadingParty: 'party-bjp',
    leadingPartyColor: '#FF9933',
    leadingCandidateEn: 'Devendra Fadnavis / Eknath Shinde',
    leadingCandidateHi: 'देवेंद्र फडणवीस / एकनाथ शिंदे',
    projectedShare: 46.8,
  },
  {
    id: 'goa',
    code: 'GA',
    nameEn: 'Goa',
    nameHi: 'गोवा',
    cx: 195,
    cy: 565,
    path: 'M 190,560 L 202,560 L 200,572 L 188,570 Z',
    defaultLeadingParty: 'party-bjp',
    leadingPartyColor: '#FF9933',
    leadingCandidateEn: 'Pramod Sawant',
    leadingCandidateHi: 'प्रमोद सावंत',
    projectedShare: 47.9,
  },
  {
    id: 'telangana',
    code: 'TG',
    nameEn: 'Telangana',
    nameHi: 'तेलंगाना',
    cx: 310,
    cy: 530,
    path: 'M 280,490 L 350,490 L 340,565 L 275,550 Z',
    defaultLeadingParty: 'party-inc',
    leadingPartyColor: '#0EA5E9',
    leadingCandidateEn: 'Revanth Reddy',
    leadingCandidateHi: 'रेवंत रेड्डी',
    projectedShare: 53.1,
  },
  {
    id: 'andhra-pradesh',
    code: 'AP',
    nameEn: 'Andhra Pradesh',
    nameHi: 'आंध्र प्रदेश',
    cx: 335,
    cy: 610,
    path: 'M 325,555 L 395,505 L 360,650 L 305,640 Z',
    defaultLeadingParty: 'party-tdp',
    leadingPartyColor: '#EAB308',
    leadingCandidateEn: 'N. Chandrababu Naidu',
    leadingCandidateHi: 'एन. चंद्रबाबू नायडू',
    projectedShare: 55.6,
  },
  {
    id: 'karnataka',
    code: 'KA',
    nameEn: 'Karnataka',
    nameHi: 'कर्नाटक',
    cx: 235,
    cy: 610,
    path: 'M 205,535 L 275,535 L 285,650 L 205,650 Z',
    defaultLeadingParty: 'party-inc',
    leadingPartyColor: '#0EA5E9',
    leadingCandidateEn: 'Siddaramaiah',
    leadingCandidateHi: 'सिद्धारमैया',
    projectedShare: 49.8,
  },
  {
    id: 'tamil-nadu',
    code: 'TN',
    nameEn: 'Tamil Nadu',
    nameHi: 'तमिलनाडु',
    cx: 280,
    cy: 710,
    path: 'M 255,645 L 325,645 L 315,765 L 255,750 Z',
    defaultLeadingParty: 'party-dmk',
    leadingPartyColor: '#EF4444',
    leadingCandidateEn: 'M. K. Stalin',
    leadingCandidateHi: 'एम. के. स्टालिन',
    projectedShare: 51.2,
  },
  {
    id: 'kerala',
    code: 'KL',
    nameEn: 'Kerala',
    nameHi: 'केरल',
    cx: 235,
    cy: 715,
    path: 'M 225,655 L 255,655 L 250,755 L 220,735 Z',
    defaultLeadingParty: 'party-cpim',
    leadingPartyColor: '#DC2626',
    leadingCandidateEn: 'Pinarayi Vijayan',
    leadingCandidateHi: 'पिनाराई विजयन',
    projectedShare: 46.5,
  },
  // North East
  {
    id: 'assam',
    code: 'AS',
    nameEn: 'Assam',
    nameHi: 'असम',
    cx: 565,
    cy: 295,
    path: 'M 535,275 L 610,285 L 595,325 L 535,310 Z',
    defaultLeadingParty: 'party-bjp',
    leadingPartyColor: '#FF9933',
    leadingCandidateEn: 'Himanta Biswa Sarma',
    leadingCandidateHi: 'हिमंत बिस्वा सरमा',
    projectedShare: 56.4,
  },
];

export function IndiaMap({
  onSelectState,
  selectedStateId = 'uttar-pradesh',
  className = '',
  showLinkToCM = true,
}: IndiaMapProps) {
  const { language } = useI18n();
  const [activeStateId, setActiveStateId] = useState<string>(selectedStateId);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state if controlled from outside
  React.useEffect(() => {
    if (selectedStateId) {
      setActiveStateId(selectedStateId);
    }
  }, [selectedStateId]);

  const activeState = useMemo(() => {
    return (
      STATE_GEO_DATA.find((s) => s.id === activeStateId) ||
      STATE_GEO_DATA.find((s) => s.id === 'uttar-pradesh') ||
      STATE_GEO_DATA[0]
    );
  }, [activeStateId]);

  const rawStateDetails = useMemo(() => {
    return INDIAN_STATES.find((s) => s.id === activeState.id);
  }, [activeState.id]);

  const handleStateClick = (stateId: string) => {
    setActiveStateId(stateId);
    if (onSelectState) {
      onSelectState(stateId);
    }
  };

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return STATE_GEO_DATA.filter(
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
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              {language === 'hi' ? 'इंटरएक्टिव भारत मानचित्र' : 'Interactive India Civic Map'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {language === 'hi'
              ? 'राज्यवार जनमत एवं रुझान नक्शा'
              : 'State-by-State Opinion Poll Explorer'}
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
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] shadow-xl max-h-48 overflow-y-auto space-y-1">
              {filteredStates.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    handleStateClick(s.id);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-[var(--text-primary)]">
                    {language === 'hi' ? s.nameHi : s.nameEn}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{s.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: SVG Map on Left, Active State Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Map Container */}
        <GlassCard elevated className="lg:col-span-7 p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs text-[var(--text-tertiary)] mb-2 px-2">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{language === 'hi' ? 'राज्य पर क्लिक या टैप करें' : 'Click or tap any state'}</span>
            </span>
            <span className="text-[11px] font-mono">
              {STATE_GEO_DATA.length} States / Territories Covered
            </span>
          </div>

          {/* SVG Map of India */}
          <div className="w-full max-w-[500px] aspect-[4/5] relative flex items-center justify-center">
            <svg
              viewBox="0 0 650 820"
              className="w-full h-full drop-shadow-md select-none transition-all duration-300"
              style={{ filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.15))' }}
            >
              {/* Subtle Map Outline Glow */}
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* State Shapes */}
              {STATE_GEO_DATA.map((state) => {
                const isSelected = activeState.id === state.id;
                return (
                  <g
                    key={state.id}
                    className="cursor-pointer transition-all duration-200 group"
                    onClick={() => handleStateClick(state.id)}
                  >
                    {/* Path Outline */}
                    <path
                      d={state.path}
                      fill={isSelected ? state.leadingPartyColor : 'var(--bg-surface)'}
                      fillOpacity={isSelected ? 0.85 : 0.45}
                      stroke={isSelected ? '#FFFFFF' : 'var(--border-glass)'}
                      strokeWidth={isSelected ? 2.5 : 1.2}
                      className="transition-all duration-300 hover:fill-opacity-90 hover:stroke-[var(--accent)] hover:stroke-2"
                      style={
                        isSelected
                          ? { filter: 'drop-shadow(0 0 8px rgba(37,99,235,0.5))' }
                          : undefined
                      }
                    />

                    {/* State Code Label */}
                    <text
                      x={state.cx}
                      y={state.cy}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontSize={isSelected ? '13' : '11'}
                      fontWeight="bold"
                      fill={isSelected ? '#FFFFFF' : 'var(--text-secondary)'}
                      className="pointer-events-none transition-all select-none font-mono"
                    >
                      {state.code}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Color Legend */}
          <div className="w-full pt-4 mt-2 border-t border-[var(--border-glass)] flex items-center justify-center gap-4 flex-wrap text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#FF9933]" />
              <span className="font-semibold text-[11px]">BJP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#0EA5E9]" />
              <span className="font-semibold text-[11px]">INC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#F59E0B]" />
              <span className="font-semibold text-[11px]">AAP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#16A34A]" />
              <span className="font-semibold text-[11px]">SP / RJD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#059669]" />
              <span className="font-semibold text-[11px]">TMC / JMM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#EF4444]" />
              <span className="font-semibold text-[11px]">DMK / CPIM</span>
            </div>
          </div>
        </GlassCard>

        {/* Selected State Detail Card */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard elevated className="p-6 space-y-5 animate-in fade-in duration-300">
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
                  Code: {activeState.code} • India
                </span>
              </div>

              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-white text-base shadow-lg"
                style={{ backgroundColor: activeState.leadingPartyColor }}
              >
                {activeState.code}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
                <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold block">
                  {language === 'hi' ? 'विधानसभा सीटें' : 'Assembly Seats'}
                </span>
                <span className="text-lg font-black text-[var(--text-primary)] font-mono">
                  {rawStateDetails?.assemblySeats || 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-glass)] space-y-1">
                <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold block">
                  {language === 'hi' ? 'प्रक्षेपित मत प्रतिशत' : 'Projected Share'}
                </span>
                <span className="text-lg font-black text-emerald-500 font-mono">
                  {activeState.projectedShare}%
                </span>
              </div>
            </div>

            {/* Leading Choice Spotlight */}
            <div className="p-4 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--accent)] uppercase tracking-wider text-[10px]">
                  {language === 'hi' ? 'सर्वेक्षण में अग्रणी दल' : 'Projected Leading Front'}
                </span>
                <GlassBadge variant="success">
                  <TrendingUp className="w-3 h-3" />
                  <span>Rank #1</span>
                </GlassBadge>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
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

          {/* Quick State Pills Strip */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
              {language === 'hi' ? 'त्वरित राज्य चयन' : 'Quick Jump to Major State:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['uttar-pradesh', 'maharashtra', 'bihar', 'delhi', 'west-bengal', 'karnataka', 'tamil-nadu', 'gujarat'].map((stId) => {
                const st = STATE_GEO_DATA.find((s) => s.id === stId);
                if (!st) return null;
                const isSelected = activeState.id === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStateClick(st.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent)] text-white shadow-sm'
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
