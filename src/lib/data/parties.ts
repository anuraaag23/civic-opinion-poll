import { Party } from '../types';

export const OFFICIAL_PARTIES: Party[] = [
  {
    id: 'party-aap',
    name_en: 'Aam Aadmi Party',
    name_hi: 'आम आदमी पार्टी',
    short_name: 'AAP',
    symbol_alt_en: 'Broom - Official Recognized Symbol of AAP',
    symbol_alt_hi: 'झाड़ू - आप का आधिकारिक मान्यता प्राप्त चुनाव चिन्ह',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-amber-700">
      <path d="M12 48L38 22L44 28L18 54Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <line x1="38" y1="22" x2="52" y2="8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      <path d="M10 52C8 54 10 58 14 56L22 48" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="16" y1="46" x2="28" y2="34" stroke="currentColor" stroke-width="1.5"/>
      <line x1="14" y1="50" x2="26" y2="38" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,
    description_en: 'National recognized political party in India.',
    description_hi: 'भारत का राष्ट्रीय मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'party-bsp',
    name_en: 'Bahujan Samaj Party',
    name_hi: 'बहुजन समाज पार्टी',
    short_name: 'BSP',
    symbol_alt_en: 'Elephant - Official Recognized Symbol of BSP',
    symbol_alt_hi: 'हाथी - बसपा का आधिकारिक मान्यता प्राप्त चुनाव चिन्ह',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-blue-700">
      <path d="M14 42V30C14 24 20 18 32 18C44 18 50 24 50 30V42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M20 42V52M28 42V52M36 42V52M44 42V52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M14 28C10 32 8 40 10 46" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="22" cy="26" r="2" fill="currentColor"/>
    </svg>`,
    description_en: 'National recognized political party founded in 1984.',
    description_hi: '1984 में स्थापित राष्ट्रीय मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'party-bjp',
    name_en: 'Bharatiya Janata Party',
    name_hi: 'भारतीय जनता पार्टी',
    short_name: 'BJP',
    symbol_alt_en: 'Lotus - Official Recognized Symbol of BJP',
    symbol_alt_hi: 'कमल - भाजपा का आधिकारिक मान्यता प्राप्त चुनाव चिन्ह',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-orange-600">
      <path d="M32 12C32 12 24 24 24 34C24 40 28 44 32 44C36 44 40 40 40 34C40 24 32 12 32 12Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <path d="M32 44C26 44 14 38 14 28C14 22 20 26 24 34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 44C38 44 50 38 50 28C50 22 44 26 40 34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 46C26 50 38 50 42 46" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M28 50L24 56M36 50L40 56" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    description_en: 'National recognized political party founded in 1980.',
    description_hi: '1980 में स्थापित राष्ट्रीय मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 3,
  },
  {
    id: 'party-cpim',
    name_en: 'Communist Party of India (Marxist)',
    name_hi: 'भारत की कम्युनिस्ट पार्टी (मार्क्सवादी)',
    short_name: 'CPI(M)',
    symbol_alt_en: 'Hammer, Sickle and Star - Official Recognized Symbol of CPI(M)',
    symbol_alt_hi: 'हथौड़ा, हंसिया और सितारा - माकपा का आधिकारिक चुनाव चिन्ह',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-red-600">
      <path d="M20 22L42 44M18 18L24 14L30 20L24 26L18 18Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M44 22C46 28 44 38 36 44C28 50 18 46 14 42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="32,10 35,18 43,18 36,23 39,31 32,26 25,31 28,23 21,18 29,18" fill="currentColor"/>
    </svg>`,
    description_en: 'National recognized political party founded in 1964.',
    description_hi: '1964 में स्थापित राष्ट्रीय मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 4,
  },
  {
    id: 'party-inc',
    name_en: 'Indian National Congress',
    name_hi: 'भारतीय राष्ट्रीय कांग्रेस',
    short_name: 'INC',
    symbol_alt_en: 'Hand - Official Recognized Symbol of INC',
    symbol_alt_hi: 'हाथ का पंजा - कांग्रेस का आधिकारिक मान्यता प्राप्त चुनाव चिन्ह',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-cyan-700">
      <path d="M24 34V18C24 16 26 14 28 14C30 14 32 16 32 18V30M32 18C32 15 34 13 36 13C38 13 40 15 40 18V30M40 20C40 17 42 15 44 15C46 15 48 17 48 20V34C48 44 42 52 34 52C24 52 20 44 20 36V28C20 26 22 24 24 24C26 24 28 26 28 28V34" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 34C16 34 14 38 16 42C18 46 22 50 26 52" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    description_en: 'National recognized political party founded in 1885.',
    description_hi: '1885 में स्थापित राष्ट्रीय मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 5,
  },
  {
    id: 'party-npp',
    name_en: "National People's Party",
    name_hi: 'नेशनल पीपल्स पार्टी',
    short_name: 'NPP',
    symbol_alt_en: 'Book - Official Recognized Symbol of NPP',
    symbol_alt_hi: 'किताब - एनपीपी का आधिकारिक मान्यता प्राप्त चुनाव चिन्ह',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-emerald-700">
      <path d="M32 18C26 14 16 14 10 16V48C16 46 26 46 32 50C38 46 48 46 54 48V16C48 14 38 14 32 18Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="32" y1="18" x2="32" y2="50" stroke="currentColor" stroke-width="2.5"/>
    </svg>`,
    description_en: 'National recognized political party in India.',
    description_hi: 'भारत का राष्ट्रीय मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 6,
  },
  {
    id: 'party-others',
    name_en: 'Other Registered State Parties / Independents',
    name_hi: 'अन्य पंजीकृत राज्य दल / निर्दलीय',
    short_name: 'Others',
    symbol_alt_en: 'Civic Scale / Independents Collective Option',
    symbol_alt_hi: 'संतुलन तराजू / अन्य निर्दलीय समूह विकल्प',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-slate-600">
      <line x1="32" y1="12" x2="32" y2="50" stroke="currentColor" stroke-width="2.5"/>
      <line x1="16" y1="22" x2="48" y2="22" stroke="currentColor" stroke-width="2.5"/>
      <path d="M12 36L16 22L20 36C20 38 12 38 12 36Z" stroke="currentColor" stroke-width="2"/>
      <path d="M44 36L48 22L52 36C52 38 44 38 44 36Z" stroke="currentColor" stroke-width="2"/>
      <line x1="24" y1="50" x2="40" y2="50" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    description_en: 'All other recognized state parties and independent civic candidates.',
    description_hi: 'अन्य सभी मान्यता प्राप्त राज्य स्तरीय दल एवं निर्दलीय उम्मीदवार।',
    source_ref: 'Collective Civic Category',
    is_active: true,
    display_order: 7,
  },
  {
    id: 'party-nota',
    name_en: 'None of the Above (NOTA)',
    name_hi: 'इनमें से कोई नहीं (नोटा)',
    short_name: 'NOTA',
    symbol_alt_en: 'Ballot stamp with cross - NOTA Civic Expression',
    symbol_alt_hi: 'मतपत्र पर क्रॉस - नोटा नागरिक अभिव्यक्ति',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-stone-600">
      <rect x="14" y="14" width="36" height="36" rx="6" stroke="currentColor" stroke-width="2.5"/>
      <line x1="22" y1="22" x2="42" y2="42" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      <line x1="42" y1="22" x2="22" y2="42" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    description_en: 'Civic expression of not supporting any listed political option.',
    description_hi: 'सूचीबद्ध किसी भी राजनीतिक विकल्प का समर्थन न करने की नागरिक अभिव्यक्ति।',
    source_ref: 'Civic Standard Option',
    is_active: true,
    display_order: 8,
  },
];
