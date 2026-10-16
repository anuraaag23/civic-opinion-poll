import { Poll } from '../types';
import { NATIONAL_PARTIES, ALL_PARTIES } from './parties';

export const INITIAL_POLLS: Poll[] = [
  {
    id: 'poll-national-2029',
    slug: 'pm-election-poll-2029',
    title_en: 'Prime Minister (PM) Civic Opinion Poll — All India (Lok Sabha)',
    title_hi: 'प्रधानमंत्री (PM) नागरिक जनमत सर्वेक्षण — संपूर्ण भारत (लोकसभा)',
    description_en:
      'All-India national opinion poll examining voter sentiment across the country for the Prime Minister election. Features national political parties contesting across India.',
    description_hi:
      'संपूर्ण भारत के लिए राष्ट्रीय जनमत सर्वेक्षण जो प्रधानमंत्री पद के लिए नागरिक रुझानों का आकलन करता है। संपूर्ण भारत में चुनाव लड़ने वाले राष्ट्रीय दल।',
    status: 'LIVE',
    start_at: '2026-01-01T00:00:00Z',
    end_at: '2029-12-31T23:59:59Z',
    results_visibility: 'PUBLIC',
    total_votes: 128420,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-16T12:00:00Z',
    options: NATIONAL_PARTIES.map((party, index) => ({
      id: `opt-${party.id}`,
      poll_id: 'poll-national-2029',
      party_id: party.id,
      party,
      display_order: index + 1,
      is_active: true,
    })),
  },
  {
    id: 'poll-state-cm-2029',
    slug: 'cm-state-assembly-poll',
    title_en: 'Chief Minister (CM) Civic Opinion Poll — State Assemblies (Vidhan Sabha)',
    title_hi: 'मुख्यमंत्री (CM) नागरिक जनमत सर्वेक्षण — राज्य विधानसभाएं',
    description_en:
      'State-specific legislative assembly poll examining citizen preferences for the Chief Minister election based on your selected Indian state and its active regional parties.',
    description_hi:
      'राज्य-विशिष्ट विधानसभा जनमत सर्वेक्षण जो आपके चयनित भारतीय राज्य और उसके सक्रिय क्षेत्रीय दलों के आधार पर मुख्यमंत्री पद की प्राथमिकताओं का आकलन करता है।',
    status: 'LIVE',
    start_at: '2026-01-01T00:00:00Z',
    end_at: '2029-12-31T23:59:59Z',
    results_visibility: 'PUBLIC',
    total_votes: 94810,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-16T12:00:00Z',
    options: ALL_PARTIES.map((party, index) => ({
      id: `opt-cm-${party.id}`,
      poll_id: 'poll-state-cm-2029',
      party_id: party.id,
      party,
      display_order: index + 1,
      is_active: true,
    })),
  },
];

// Baseline demonstration vote distribution
export const INITIAL_VOTE_COUNTS: Record<string, Record<string, number>> = {
  'poll-national-2029': {
    'opt-party-bjp': 48620,
    'opt-party-inc': 34240,
    'opt-party-sp': 18450,
    'opt-party-aap': 11890,
    'opt-party-bsp': 4120,
    'opt-party-cpim': 3410,
    'opt-party-tmc': 4280,
    'opt-party-others': 2410,
    'opt-party-nota': 1000,
  },
  'poll-state-cm-2029': {
    'opt-cm-party-bjp': 28400,
    'opt-cm-party-inc': 21300,
    'opt-cm-party-sp': 12500,
    'opt-cm-party-aap': 8200,
    'opt-cm-party-tmc': 5600,
    'opt-cm-party-dmk': 4800,
    'opt-cm-party-aiadmk': 3900,
    'opt-cm-party-tdp': 3400,
    'opt-cm-party-ysrcp': 2900,
    'opt-cm-party-jdu': 2100,
    'opt-cm-party-rjd': 2400,
    'opt-cm-party-shivsena': 1900,
    'opt-cm-party-shivsena-ubt': 2200,
    'opt-cm-party-ncp': 1100,
    'opt-cm-party-ncp-sp': 1400,
    'opt-cm-party-bjd': 1200,
    'opt-cm-party-bsp': 1100,
    'opt-cm-party-jmm': 900,
    'opt-cm-party-sad': 800,
    'opt-cm-party-jds': 700,
    'opt-cm-party-brs': 650,
    'opt-cm-party-aimim': 500,
    'opt-cm-party-ljp': 460,
    'opt-cm-party-others': 800,
    'opt-cm-party-nota': 600,
  },
};
