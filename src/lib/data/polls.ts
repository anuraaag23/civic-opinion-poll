import { Poll } from '../types';
import { OFFICIAL_PARTIES } from './parties';

export const INITIAL_POLLS: Poll[] = [
  {
    id: 'poll-national-2029',
    slug: 'national-opinion-poll-2029',
    title_en: '2029 National Civic Opinion Poll — Demo',
    title_hi: '2029 राष्ट्रीय नागरिक जनमत सर्वेक्षण — डेमो',
    description_en:
      'An independent, non-official public opinion survey examining voter preferences and civic sentiment across India. All responses are cryptographically anonymous and decoupled from voter identity.',
    description_hi:
      'एक स्वतंत्र, गैर-सरकारी जनमत सर्वेक्षण जो भारत भर में मतदाताओं की प्राथमिकताओं और नागरिक दृष्टिकोण का अध्ययन करता है। सभी प्रतिक्रियाएं क्रिप्टोग्राफिक रूप से गुमनाम हैं।',
    status: 'LIVE',
    start_at: '2026-01-01T00:00:00Z',
    end_at: '2029-12-31T23:59:59Z',
    results_visibility: 'PUBLIC',
    total_votes: 128420,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-09-30T12:00:00Z',
    options: OFFICIAL_PARTIES.map((party, index) => ({
      id: `opt-${party.id}`,
      poll_id: 'poll-national-2029',
      party_id: party.id,
      party,
      display_order: index + 1,
      is_active: true,
    })),
  },
  {
    id: 'poll-state-reforms-2027',
    slug: 'electoral-reforms-civic-poll',
    title_en: 'Electoral Reforms & Civic Transparency Poll — Demo',
    title_hi: 'चुनावी सुधार एवं नागरिक पारदर्शिता जनमत सर्वेक्षण — डेमो',
    description_en:
      'Independent civic inquiry evaluating citizen perspectives on campaign finance transparency and public debate standards.',
    description_hi:
      'चुनावी फंडिंग में पारदर्शिता और सार्वजनिक बहस के मानकों पर नागरिकों के दृष्टिकोण का मूल्यांकन करने वाला स्वतंत्र नागरिक सर्वेक्षण।',
    status: 'SCHEDULED',
    start_at: '2027-01-01T00:00:00Z',
    end_at: '2027-06-30T23:59:59Z',
    results_visibility: 'PUBLIC',
    total_votes: 0,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-09-30T12:00:00Z',
    options: [],
  },
];

// Baseline demonstration vote distribution
export const INITIAL_VOTE_COUNTS: Record<string, Record<string, number>> = {
  'poll-national-2029': {
    'opt-party-bjp': 48620,
    'opt-party-inc': 38240,
    'opt-party-aap': 14890,
    'opt-party-cpim': 6410,
    'opt-party-bsp': 5120,
    'opt-party-npp': 2340,
    'opt-party-others': 9100,
    'opt-party-nota': 3700,
  },
};
