import { Party } from '../types';
export type { Party };

export const NATIONAL_PARTIES: Party[] = [
  {
    id: 'party-bjp',
    name_en: 'Bharatiya Janata Party',
    name_hi: 'भारतीय जनता पार्टी',
    short_name: 'BJP',
    logo_url: '/parties/bjp.png',
    color: '#FF9933',
    candidate_name_en: 'Narendra Modi',
    candidate_name_hi: 'नरेंद्र मोदी',
    candidate_role_en: 'PM Candidate',
    candidate_role_hi: 'प्रधानमंत्री प्रत्याशी',
    symbol_alt_en: 'Lotus - Official Election Symbol of Bharatiya Janata Party (BJP)',
    symbol_alt_hi: 'कमल - भारतीय जनता पार्टी (भाजपा) का आधिकारिक चुनाव चिह्न',
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
    display_order: 1,
  },
  {
    id: 'party-inc',
    name_en: 'Indian National Congress',
    name_hi: 'भारतीय राष्ट्रीय कांग्रेस',
    short_name: 'INC',
    logo_url: '/parties/inc.png',
    color: '#0EA5E9',
    candidate_name_en: 'Rahul Gandhi / Mallikarjun Kharge',
    candidate_name_hi: 'राहुल गांधी / मल्लिकार्जुन खरगे',
    candidate_role_en: 'PM Candidate',
    candidate_role_hi: 'प्रधानमंत्री प्रत्याशी',
    symbol_alt_en: 'Hand - Official Election Symbol of Indian National Congress (INC)',
    symbol_alt_hi: 'हाथ का पंजा - भारतीय राष्ट्रीय कांग्रेस का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-cyan-700">
      <path d="M24 34V18C24 16 26 14 28 14C30 14 32 16 32 18V30M32 18C32 15 34 13 36 13C38 13 40 15 40 18V30M40 20C40 17 42 15 44 15C46 15 48 17 48 20V34C48 44 42 52 34 52C24 52 20 44 20 36V28C20 26 22 24 24 24C26 24 28 26 28 28V34" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    description_en: 'National recognized political party founded in 1885.',
    description_hi: '1885 में स्थापित राष्ट्रीय मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'party-sp',
    name_en: 'Samajwadi Party',
    name_hi: 'समाजवादी पार्टी',
    short_name: 'SP',
    logo_url: '/parties/sp.png',
    color: '#E11D48',
    candidate_name_en: 'Akhilesh Yadav',
    candidate_name_hi: 'अखिलेश यादव',
    candidate_role_en: 'PM Candidate',
    candidate_role_hi: 'प्रधानमंत्री प्रत्याशी',
    symbol_alt_en: 'Bicycle - Official Election Symbol of Samajwadi Party (SP)',
    symbol_alt_hi: 'साइकिल - समाजवादी पार्टी का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-red-600">
      <circle cx="18" cy="40" r="10" stroke="currentColor" stroke-width="2.5"/>
      <circle cx="46" cy="40" r="10" stroke="currentColor" stroke-width="2.5"/>
      <path d="M18 40L30 40L38 24M38 24L46 40M38 24L26 24M30 40L38 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    description_en: 'Major state recognized political party founded in 1992.',
    description_hi: '1992 में स्थापित प्रमुख मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 3,
  },
  {
    id: 'party-aap',
    name_en: 'Aam Aadmi Party',
    name_hi: 'आम आदमी पार्टी',
    short_name: 'AAP',
    logo_url: '/parties/aap.jpg',
    color: '#0284C7',
    candidate_name_en: 'Arvind Kejriwal',
    candidate_name_hi: 'अरविंद केजरीवाल',
    candidate_role_en: 'PM Candidate',
    candidate_role_hi: 'प्रधानमंत्री प्रत्याशी',
    symbol_alt_en: 'Broom - Official Election Symbol of Aam Aadmi Party (AAP)',
    symbol_alt_hi: 'झाड़ू - आम आदमी पार्टी का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-amber-700">
      <path d="M12 48L38 22L44 28L18 54Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <line x1="38" y1="22" x2="52" y2="8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    description_en: 'National recognized political party founded in 2012.',
    description_hi: '2012 में स्थापित राष्ट्रीय मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 4,
  },
  {
    id: 'party-bsp',
    name_en: 'Bahujan Samaj Party',
    name_hi: 'बहुजन समाज पार्टी',
    short_name: 'BSP',
    logo_url: '/parties/bsp.jpg',
    color: '#1D4ED8',
    candidate_name_en: 'Mayawati',
    candidate_name_hi: 'मायावती',
    candidate_role_en: 'PM Candidate',
    candidate_role_hi: 'प्रधानमंत्री प्रत्याशी',
    symbol_alt_en: 'Elephant - Official Election Symbol of Bahujan Samaj Party (BSP)',
    symbol_alt_hi: 'हाथी - बहुजन समाज पार्टी का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-blue-700">
      <path d="M14 42V30C14 24 20 18 32 18C44 18 50 24 50 30V42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M20 42V52M28 42V52M36 42V52M44 42V52" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    description_en: 'National recognized political party founded in 1984.',
    description_hi: '1984 में स्थापित राष्ट्रीय मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 5,
  },
  {
    id: 'party-cpim',
    name_en: 'Communist Party of India (Marxist)',
    name_hi: 'भारत की कम्युनिस्ट पार्टी (मार्क्सवादी)',
    short_name: 'CPI(M)',
    logo_url: '/parties/cpim.jpg',
    color: '#DC2626',
    candidate_name_en: 'Left Front Leadership',
    candidate_name_hi: 'वाम मोर्चा नेतृत्व',
    candidate_role_en: 'PM Candidate',
    candidate_role_hi: 'प्रधानमंत्री प्रत्याशी',
    symbol_alt_en: 'Hammer, Sickle and Star - Official Symbol of CPI(M)',
    symbol_alt_hi: 'हथौड़ा, हंसिया और सितारा - माकपा का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-red-600">
      <path d="M20 22L42 44M18 18L24 14L30 20L24 26L18 18Z" stroke="currentColor" stroke-width="2.5"/>
      <polygon points="32,10 35,18 43,18 36,23 39,31 32,26 25,31 28,23 21,18 29,18" fill="currentColor"/>
    </svg>`,
    description_en: 'National recognized political party founded in 1964.',
    description_hi: '1964 में स्थापित राष्ट्रीय मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 6,
  },
  {
    id: 'party-tmc',
    name_en: 'All India Trinamool Congress',
    name_hi: 'सर्वभारतीय तृणमूल कांग्रेस',
    short_name: 'AITC',
    logo_url: '/parties/tmc.png',
    color: '#10B981',
    candidate_name_en: 'Mamata Banerjee',
    candidate_name_hi: 'ममता बनर्जी',
    candidate_role_en: 'PM Candidate',
    candidate_role_hi: 'प्रधानमंत्री प्रत्याशी',
    symbol_alt_en: 'Twin Flowers and Grass - Official Symbol of AITC',
    symbol_alt_hi: 'जोड़ा फूल और घास - तृणमूल कांग्रेस का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-emerald-600">
      <path d="M24 48C24 36 28 26 32 20C36 26 40 36 40 48" stroke="currentColor" stroke-width="2.5"/>
      <circle cx="28" cy="22" r="5" fill="currentColor"/>
      <circle cx="36" cy="22" r="5" fill="currentColor"/>
    </svg>`,
    description_en: 'Major state recognized political party founded in 1998.',
    description_hi: '1998 में स्थापित प्रमुख मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 7,
  },
  {
    id: 'party-others',
    name_en: 'Other Registered State Parties / Independents',
    name_hi: 'अन्य पंजीकृत राज्य दल / निर्दलीय',
    short_name: 'Others',
    logo_url: '/parties/others.svg',
    color: '#64748B',
    candidate_name_en: 'Independent / Other PM Nominee',
    candidate_name_hi: 'निर्दलीय / अन्य प्रधानमंत्री प्रत्याशी',
    candidate_role_en: 'PM Candidate',
    candidate_role_hi: 'प्रधानमंत्री प्रत्याशी',
    symbol_alt_en: 'Civic Scale - Other Parties and Independent Candidates',
    symbol_alt_hi: 'संतुलन तराजू - अन्य दल एवं निर्दलीय उम्मीदवार',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-slate-600">
      <line x1="32" y1="12" x2="32" y2="50" stroke="currentColor" stroke-width="2.5"/>
      <line x1="16" y1="22" x2="48" y2="22" stroke="currentColor" stroke-width="2.5"/>
    </svg>`,
    description_en: 'All other recognized state parties and independent civic candidates.',
    description_hi: 'अन्य सभी मान्यता प्राप्त राज्य स्तरीय दल एवं निर्दलीय उम्मीदवार।',
    source_ref: 'Collective Civic Category',
    is_active: true,
    display_order: 8,
  },
  {
    id: 'party-nota',
    name_en: 'None of the Above (NOTA)',
    name_hi: 'इनमें से कोई नहीं (नोटा)',
    short_name: 'NOTA',
    logo_url: '/parties/nota.png',
    color: '#525252',
    candidate_name_en: 'None of the Above',
    candidate_name_hi: 'इनमें से कोई नहीं',
    candidate_role_en: 'Rejection Choice',
    candidate_role_hi: 'अस्वीकृति विकल्प',
    symbol_alt_en: 'Ballot stamp with cross - NOTA Civic Expression',
    symbol_alt_hi: 'मतपत्र पर क्रॉस - नोटा नागरिक अभिव्यक्ति',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-stone-600">
      <rect x="14" y="14" width="36" height="36" rx="6" stroke="currentColor" stroke-width="2.5"/>
      <line x1="22" y1="22" x2="42" y2="42" stroke="currentColor" stroke-width="3"/>
      <line x1="42" y1="22" x2="22" y2="42" stroke="currentColor" stroke-width="3"/>
    </svg>`,
    description_en: 'Civic expression of not supporting any listed political option.',
    description_hi: 'सूचीबद्ध किसी भी राजनीतिक विकल्प का समर्थन न करने की नागरिक अभिव्यक्ति।',
    source_ref: 'Civic Standard Option',
    is_active: true,
    display_order: 9,
  },
];

export const REGIONAL_PARTIES: Party[] = [
  {
    id: 'party-jdu',
    name_en: 'Janata Dal (United)',
    name_hi: 'जनता दल (यूनाइटेड)',
    short_name: 'JD(U)',
    logo_url: '/parties/jdu.svg',
    color: '#15803d',
    symbol_alt_en: 'Arrow - Official Election Symbol of Janata Dal (United)',
    symbol_alt_hi: 'तीर - जनता दल (यूनाइटेड) का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-emerald-700">
      <path d="M12 32h36M36 20l16 12-16 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    description_en: 'Major state party in Bihar founded in 2003.',
    description_hi: '2003 में स्थापित बिहार का प्रमुख राज्य स्तरीय राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 10,
  },
  {
    id: 'party-rjd',
    name_en: 'Rashtriya Janata Dal',
    name_hi: 'राष्ट्रीय जनता दल',
    short_name: 'RJD',
    logo_url: '/parties/rjd.svg',
    color: '#166534',
    symbol_alt_en: 'Hurricane Lantern - Official Election Symbol of RJD',
    symbol_alt_hi: 'लालटेन - राष्ट्रीय जनता दल का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-emerald-800">
      <path d="M24 16h16v8H24zM20 24h24v20H20zM22 44h20v8H22z" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    description_en: 'Major state party in Bihar founded in 1997.',
    description_hi: '1997 में स्थापित बिहार का प्रमुख राज्य स्तरीय राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 11,
  },
  {
    id: 'party-dmk',
    name_en: 'Dravida Munnetra Kazhagam',
    name_hi: 'द्रविड़ मुनेत्र कड़गम',
    short_name: 'DMK',
    logo_url: '/parties/dmk.svg',
    color: '#dc2626',
    symbol_alt_en: 'Rising Sun - Official Election Symbol of DMK',
    symbol_alt_hi: 'उगता सूरज - द्रमुक का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-red-600">
      <circle cx="32" cy="40" r="16" fill="currentColor"/>
    </svg>`,
    description_en: 'Major ruling state party in Tamil Nadu founded in 1949.',
    description_hi: 'तमिलनाडु का प्रमुख सत्तारूढ़ राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 12,
  },
  {
    id: 'party-aiadmk',
    name_en: 'All India Anna Dravida Munnetra Kazhagam',
    name_hi: 'अखिल भारतीय अन्ना द्रविड़ मुनेत्र कड़गम',
    short_name: 'AIADMK',
    logo_url: '/parties/aiadmk.svg',
    color: '#16a34a',
    symbol_alt_en: 'Two Leaves - Official Election Symbol of AIADMK',
    symbol_alt_hi: 'दो पत्तियां - अन्नाद्रमुक का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-green-600">
      <path d="M32 48C24 36 16 32 20 20C28 20 32 28 32 48Z" fill="currentColor"/>
      <path d="M32 48C40 36 48 32 44 20C36 20 32 28 32 48Z" fill="currentColor"/>
    </svg>`,
    description_en: 'Major state party in Tamil Nadu founded in 1972.',
    description_hi: 'तमिलनाडु का प्रमुख राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 13,
  },
  {
    id: 'party-shivsena',
    name_en: 'Shiv Sena',
    name_hi: 'शिवसेना',
    short_name: 'SHS',
    logo_url: '/parties/shivsena.svg',
    color: '#ea580c',
    symbol_alt_en: 'Bow and Arrow - Official Election Symbol of Shiv Sena',
    symbol_alt_hi: 'धनुष-बाण - शिवसेना का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-orange-600">
      <path d="M20 16C36 24 36 40 20 48" stroke="currentColor" stroke-width="3"/>
      <line x1="16" y1="32" x2="48" y2="32" stroke="currentColor" stroke-width="3"/>
    </svg>`,
    description_en: 'Major state party in Maharashtra founded in 1966.',
    description_hi: 'महाराष्ट्र का प्रमुख मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 14,
  },
  {
    id: 'party-shivsena-ubt',
    name_en: 'Shiv Sena (Uddhav Balasaheb Thackeray)',
    name_hi: 'शिवसेना (उद्धव बालासाहेब ठाकरे)',
    short_name: 'SS (UBT)',
    logo_url: '/parties/shivsena_ubt.svg',
    color: '#c2410c',
    symbol_alt_en: 'Flaming Torch - Official Election Symbol of Shiv Sena (UBT)',
    symbol_alt_hi: 'मशाल - शिवसेना (उद्धव बालासाहेब ठाकरे) का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-amber-600">
      <path d="M28 32h8v20h-8z" fill="currentColor"/>
    </svg>`,
    description_en: 'State recognized political party in Maharashtra.',
    description_hi: 'महाराष्ट्र का प्रमुख मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 15,
  },
  {
    id: 'party-ncp',
    name_en: 'Nationalist Congress Party',
    name_hi: 'राष्ट्रवादी कांग्रेस पार्टी',
    short_name: 'NCP',
    logo_url: '/parties/ncp.svg',
    color: '#0284c7',
    symbol_alt_en: 'Clock - Official Election Symbol of Nationalist Congress Party',
    symbol_alt_hi: 'घड़ी - राष्ट्रवादी कांग्रेस पार्टी का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-blue-600">
      <circle cx="32" cy="34" r="16" stroke="currentColor" stroke-width="3"/>
      <polyline points="26,26 32,34 38,30" stroke="currentColor" stroke-width="2.5"/>
    </svg>`,
    description_en: 'State recognized political party in Maharashtra founded in 1999.',
    description_hi: 'महाराष्ट्र का प्रमुख मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 16,
  },
  {
    id: 'party-ncp-sp',
    name_en: 'NCP (Sharadchandra Pawar)',
    name_hi: 'राकांपा (शरदचंद्र पवार)',
    short_name: 'NCP (SP)',
    logo_url: '/parties/ncp_sp.svg',
    color: '#0369a1',
    symbol_alt_en: 'Man Blowing Tutari - Official Symbol of NCP (SP)',
    symbol_alt_hi: 'तुतारी बजाता व्यक्ति - राकांपा (शरदचंद्र पवार) का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-cyan-800">
      <path d="M24 32C32 20 44 24 48 30" stroke="currentColor" stroke-width="3"/>
    </svg>`,
    description_en: 'State recognized political party in Maharashtra led by Sharad Pawar.',
    description_hi: 'महाराष्ट्र का प्रमुख मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 17,
  },
  {
    id: 'party-tdp',
    name_en: 'Telugu Desam Party',
    name_hi: 'तेलुगु देशम पार्टी',
    short_name: 'TDP',
    logo_url: '/parties/tdp.svg',
    color: '#eab308',
    symbol_alt_en: 'Bicycle on Yellow - Official Symbol of Telugu Desam Party (TDP)',
    symbol_alt_hi: 'साइकिल - तेलुगु देशम पार्टी का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-yellow-600">
      <circle cx="18" cy="40" r="10" stroke="currentColor" stroke-width="2.5"/>
      <circle cx="46" cy="40" r="10" stroke="currentColor" stroke-width="2.5"/>
    </svg>`,
    description_en: 'Major ruling state party in Andhra Pradesh founded in 1982.',
    description_hi: 'आंध्र प्रदेश का प्रमुख सत्तारूढ़ राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 18,
  },
  {
    id: 'party-ysrcp',
    name_en: 'YSR Congress Party',
    name_hi: 'वाईएसआर कांग्रेस पार्टी',
    short_name: 'YSRCP',
    logo_url: '/parties/ysrcp.svg',
    color: '#1e40af',
    symbol_alt_en: 'Ceiling Fan - Official Election Symbol of YSR Congress Party',
    symbol_alt_hi: 'सीलिंग फैन - वाईएसआर कांग्रेस पार्टी का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-blue-700">
      <circle cx="32" cy="32" r="8" fill="currentColor"/>
    </svg>`,
    description_en: 'Major state party in Andhra Pradesh founded in 2011.',
    description_hi: 'आंध्र प्रदेश का प्रमुख राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 19,
  },
  {
    id: 'party-jsp',
    name_en: 'Jana Sena Party',
    name_hi: 'जन सेना पार्टी',
    short_name: 'JSP',
    logo_url: '/parties/jsp.svg',
    color: '#dc2626',
    symbol_alt_en: 'Glass Tumbler - Official Election Symbol of Jana Sena Party',
    symbol_alt_hi: 'कांच का गिलास - जन सेना पार्टी का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-red-600">
      <path d="M22 18L26 46H38L42 18Z" stroke="currentColor" stroke-width="2.5"/>
    </svg>`,
    description_en: 'State recognized political party in Andhra Pradesh founded by Pawan Kalyan.',
    description_hi: 'आंध्र प्रदेश का प्रमुख राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 20,
  },
  {
    id: 'party-brs',
    name_en: 'Bharat Rashtra Samithi',
    name_hi: 'भारत राष्ट्र समिति',
    short_name: 'BRS',
    logo_url: '/parties/brs.svg',
    color: '#ec4899',
    symbol_alt_en: 'Car - Official Election Symbol of Bharat Rashtra Samithi (BRS)',
    symbol_alt_hi: 'कार - भारत राष्ट्र समिति का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-pink-600">
      <rect x="14" y="26" width="36" height="16" rx="4" stroke="currentColor" stroke-width="2.5"/>
    </svg>`,
    description_en: 'Major state party in Telangana founded in 2001.',
    description_hi: 'तेलंगाना का प्रमुख राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 21,
  },
  {
    id: 'party-bjd',
    name_en: 'Biju Janata Dal',
    name_hi: 'बीजू जनता दल',
    short_name: 'BJD',
    logo_url: '/parties/bjd.svg',
    color: '#15803d',
    symbol_alt_en: 'Conch - Official Election Symbol of Biju Janata Dal (BJD)',
    symbol_alt_hi: 'शंख - बीजू जनता दल का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-green-700">
      <path d="M20 40C16 32 24 20 36 18C44 24 44 36 32 42Z" fill="currentColor"/>
    </svg>`,
    description_en: 'Major state party in Odisha founded in 1997.',
    description_hi: 'ओडिशा का प्रमुख राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 22,
  },
  {
    id: 'party-jmm',
    name_en: 'Jharkhand Mukti Morcha',
    name_hi: 'झारखंड मुक्ति मोर्चा',
    short_name: 'JMM',
    logo_url: '/parties/jmm.svg',
    color: '#15803d',
    symbol_alt_en: 'Bow and Arrow - Official Election Symbol of JMM',
    symbol_alt_hi: 'धनुष-बाण - झारखंड मुक्ति मोर्चा का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-green-700">
      <path d="M20 16C36 24 36 40 20 48" stroke="currentColor" stroke-width="3"/>
      <line x1="16" y1="32" x2="48" y2="32" stroke="currentColor" stroke-width="3"/>
    </svg>`,
    description_en: 'Ruling state party in Jharkhand founded in 1972.',
    description_hi: 'झारखंड का प्रमुख सत्तारूढ़ राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 23,
  },
  {
    id: 'party-sad',
    name_en: 'Shiromani Akali Dal',
    name_hi: 'शिरोमणि अकाली दल',
    short_name: 'SAD',
    logo_url: '/parties/sad.svg',
    color: '#1e3a8a',
    symbol_alt_en: 'Scales - Official Election Symbol of Shiromani Akali Dal',
    symbol_alt_hi: 'तराजू - शिरोमणि अकाली दल का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-blue-900">
      <line x1="32" y1="14" x2="32" y2="48" stroke="currentColor" stroke-width="2.5"/>
      <line x1="16" y1="22" x2="48" y2="22" stroke="currentColor" stroke-width="2.5"/>
    </svg>`,
    description_en: 'Historic state party in Punjab founded in 1920.',
    description_hi: 'पंजाब का ऐतिहासिक राज्य स्तरीय राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 24,
  },
  {
    id: 'party-jds',
    name_en: 'Janata Dal (Secular)',
    name_hi: 'जनता दल (सेक्युलर)',
    short_name: 'JD(S)',
    logo_url: '/parties/jds.svg',
    color: '#15803d',
    symbol_alt_en: 'Lady Farmer with Paddy - Official Symbol of JD(S)',
    symbol_alt_hi: 'सिर पर धान का बोझा उठाए महिला किसान - जद(एस) का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-green-700">
      <circle cx="32" cy="24" r="8" fill="currentColor"/>
    </svg>`,
    description_en: 'Major state party in Karnataka founded in 1999.',
    description_hi: 'कर्नाटक का प्रमुख राज्य स्तरीय राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 25,
  },
  {
    id: 'party-aimim',
    name_en: 'All India Majlis-e-Ittehadul Muslimeen',
    name_hi: 'ऑल इंडिया मजलिस-ए-इत्तेहादुल मुस्लिमीन',
    short_name: 'AIMIM',
    logo_url: '/parties/aimim.svg',
    color: '#14532d',
    symbol_alt_en: 'Kite - Official Election Symbol of AIMIM',
    symbol_alt_hi: 'पतंग - एआईएमआईएम का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-green-800">
      <polygon points="32,14 46,28 32,42 18,28" stroke="currentColor" stroke-width="2.5"/>
    </svg>`,
    description_en: 'State recognized political party in Telangana.',
    description_hi: 'तेलंगाना का प्रमुख मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 26,
  },
  {
    id: 'party-ljp',
    name_en: 'Lok Janshakti Party (Ram Vilas)',
    name_hi: 'लोक जनशक्ति पार्टी (रामविलास)',
    short_name: 'LJP (RV)',
    logo_url: '/parties/ljp.svg',
    color: '#1e3a8a',
    symbol_alt_en: 'Helicopter - Official Election Symbol of LJP (Ram Vilas)',
    symbol_alt_hi: 'हेलिकॉप्टर - लोक जनशक्ति पार्टी (रामविलास) का आधिकारिक चुनाव चिह्न',
    symbol_svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-blue-800">
      <line x1="16" y1="20" x2="48" y2="20" stroke="currentColor" stroke-width="3"/>
      <rect x="20" y="24" width="24" height="14" rx="4" stroke="currentColor" stroke-width="2.5"/>
    </svg>`,
    description_en: 'State recognized political party in Bihar led by Chirag Paswan.',
    description_hi: 'बिहार का प्रमुख मान्यता प्राप्त राजनीतिक दल।',
    source_ref: 'Election Commission of India Political Parties List',
    is_active: true,
    display_order: 27,
  },
];

export const ALL_PARTIES: Party[] = [...NATIONAL_PARTIES, ...REGIONAL_PARTIES];
export const OFFICIAL_PARTIES: Party[] = NATIONAL_PARTIES;

export interface IndianState {
  id: string;
  name_en: string;
  name_hi: string;
  code: string;
  type: 'STATE' | 'UT';
  hasAssembly: boolean;
  assemblySeats?: number;
  party_ids: string[];
}

export const INDIAN_STATES: IndianState[] = [
  {
    id: 'uttar-pradesh',
    name_en: 'Uttar Pradesh',
    name_hi: 'उत्तर प्रदेश',
    code: 'UP',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 403,
    party_ids: ['party-bjp', 'party-sp', 'party-bsp', 'party-inc', 'party-aap', 'party-others', 'party-nota'],
  },
  {
    id: 'maharashtra',
    name_en: 'Maharashtra',
    name_hi: 'महाराष्ट्र',
    code: 'MH',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 288,
    party_ids: ['party-bjp', 'party-shivsena', 'party-shivsena-ubt', 'party-ncp', 'party-ncp-sp', 'party-inc', 'party-aap', 'party-others', 'party-nota'],
  },
  {
    id: 'bihar',
    name_en: 'Bihar',
    name_hi: 'बिहार',
    code: 'BR',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 243,
    party_ids: ['party-jdu', 'party-rjd', 'party-bjp', 'party-inc', 'party-ljp', 'party-others', 'party-nota'],
  },
  {
    id: 'west-bengal',
    name_en: 'West Bengal',
    name_hi: 'पश्चिम बंगाल',
    code: 'WB',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 294,
    party_ids: ['party-tmc', 'party-bjp', 'party-cpim', 'party-inc', 'party-others', 'party-nota'],
  },
  {
    id: 'tamil-nadu',
    name_en: 'Tamil Nadu',
    name_hi: 'तमिलनाडु',
    code: 'TN',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 234,
    party_ids: ['party-dmk', 'party-aiadmk', 'party-bjp', 'party-inc', 'party-others', 'party-nota'],
  },
  {
    id: 'delhi',
    name_en: 'Delhi (NCT)',
    name_hi: 'दिल्ली (एनसीटी)',
    code: 'DL',
    type: 'UT',
    hasAssembly: true,
    assemblySeats: 70,
    party_ids: ['party-aap', 'party-bjp', 'party-inc', 'party-others', 'party-nota'],
  },
  {
    id: 'andhra-pradesh',
    name_en: 'Andhra Pradesh',
    name_hi: 'आंध्र प्रदेश',
    code: 'AP',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 175,
    party_ids: ['party-tdp', 'party-ysrcp', 'party-jsp', 'party-bjp', 'party-inc', 'party-others', 'party-nota'],
  },
  {
    id: 'telangana',
    name_en: 'Telangana',
    name_hi: 'तेलंगाना',
    code: 'TS',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 119,
    party_ids: ['party-inc', 'party-brs', 'party-bjp', 'party-aimim', 'party-others', 'party-nota'],
  },
  {
    id: 'karnataka',
    name_en: 'Karnataka',
    name_hi: 'कर्नाटक',
    code: 'KA',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 224,
    party_ids: ['party-inc', 'party-bjp', 'party-jds', 'party-aap', 'party-others', 'party-nota'],
  },
  {
    id: 'kerala',
    name_en: 'Kerala',
    name_hi: 'केरल',
    code: 'KL',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 140,
    party_ids: ['party-cpim', 'party-inc', 'party-bjp', 'party-others', 'party-nota'],
  },
  {
    id: 'punjab',
    name_en: 'Punjab',
    name_hi: 'पंजाब',
    code: 'PB',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 117,
    party_ids: ['party-aap', 'party-inc', 'party-sad', 'party-bjp', 'party-others', 'party-nota'],
  },
  {
    id: 'odisha',
    name_en: 'Odisha',
    name_hi: 'ओडिशा',
    code: 'OD',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 147,
    party_ids: ['party-bjd', 'party-bjp', 'party-inc', 'party-others', 'party-nota'],
  },
  {
    id: 'jharkhand',
    name_en: 'Jharkhand',
    name_hi: 'झारखंड',
    code: 'JH',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 81,
    party_ids: ['party-jmm', 'party-bjp', 'party-inc', 'party-rjd', 'party-others', 'party-nota'],
  },
  {
    id: 'rajasthan',
    name_en: 'Rajasthan',
    name_hi: 'राजस्थान',
    code: 'RJ',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 200,
    party_ids: ['party-bjp', 'party-inc', 'party-bsp', 'party-aap', 'party-others', 'party-nota'],
  },
  {
    id: 'gujarat',
    name_en: 'Gujarat',
    name_hi: 'गुजरात',
    code: 'GJ',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 182,
    party_ids: ['party-bjp', 'party-inc', 'party-aap', 'party-others', 'party-nota'],
  },
  {
    id: 'madhya-pradesh',
    name_en: 'Madhya Pradesh',
    name_hi: 'मध्य प्रदेश',
    code: 'MP',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 230,
    party_ids: ['party-bjp', 'party-inc', 'party-bsp', 'party-sp', 'party-others', 'party-nota'],
  },
  {
    id: 'haryana',
    name_en: 'Haryana',
    name_hi: 'हरियाणा',
    code: 'HR',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 90,
    party_ids: ['party-bjp', 'party-inc', 'party-aap', 'party-others', 'party-nota'],
  },
  {
    id: 'assam',
    name_en: 'Assam',
    name_hi: 'असम',
    code: 'AS',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 126,
    party_ids: ['party-bjp', 'party-inc', 'party-tmc', 'party-aap', 'party-others', 'party-nota'],
  },
  {
    id: 'chhattisgarh',
    name_en: 'Chhattisgarh',
    name_hi: 'छत्तीसगढ़',
    code: 'CG',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 90,
    party_ids: ['party-bjp', 'party-inc', 'party-bsp', 'party-others', 'party-nota'],
  },
  {
    id: 'himachal-pradesh',
    name_en: 'Himachal Pradesh',
    name_hi: 'हिमाचल प्रदेश',
    code: 'HP',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 68,
    party_ids: ['party-inc', 'party-bjp', 'party-aap', 'party-others', 'party-nota'],
  },
  {
    id: 'uttarakhand',
    name_en: 'Uttarakhand',
    name_hi: 'उत्तराखंड',
    code: 'UK',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 70,
    party_ids: ['party-bjp', 'party-inc', 'party-aap', 'party-bsp', 'party-others', 'party-nota'],
  },
  {
    id: 'goa',
    name_en: 'Goa',
    name_hi: 'गोवा',
    code: 'GA',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 40,
    party_ids: ['party-bjp', 'party-inc', 'party-aap', 'party-tmc', 'party-others', 'party-nota'],
  },
  {
    id: 'jammu-kashmir',
    name_en: 'Jammu and Kashmir',
    name_hi: 'जम्मू और कश्मीर',
    code: 'JK',
    type: 'UT',
    hasAssembly: true,
    assemblySeats: 90,
    party_ids: ['party-bjp', 'party-inc', 'party-aap', 'party-others', 'party-nota'],
  },
  {
    id: 'puducherry',
    name_en: 'Puducherry',
    name_hi: 'पुडुचेरी',
    code: 'PY',
    type: 'UT',
    hasAssembly: true,
    assemblySeats: 30,
    party_ids: ['party-bjp', 'party-inc', 'party-dmk', 'party-aiadmk', 'party-others', 'party-nota'],
  },
  {
    id: 'tripura',
    name_en: 'Tripura',
    name_hi: 'त्रिपुरा',
    code: 'TR',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 60,
    party_ids: ['party-bjp', 'party-cpim', 'party-inc', 'party-tmc', 'party-others', 'party-nota'],
  },
  {
    id: 'meghalaya',
    name_en: 'Meghalaya',
    name_hi: 'मेघालय',
    code: 'ML',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 60,
    party_ids: ['party-bjp', 'party-inc', 'party-tmc', 'party-others', 'party-nota'],
  },
  {
    id: 'manipur',
    name_en: 'Manipur',
    name_hi: 'मणिपुर',
    code: 'MN',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 60,
    party_ids: ['party-bjp', 'party-inc', 'party-jdu', 'party-others', 'party-nota'],
  },
  {
    id: 'nagaland',
    name_en: 'Nagaland',
    name_hi: 'नागालैंड',
    code: 'NL',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 60,
    party_ids: ['party-bjp', 'party-inc', 'party-jdu', 'party-others', 'party-nota'],
  },
  {
    id: 'mizoram',
    name_en: 'Mizoram',
    name_hi: 'मिजोरम',
    code: 'MZ',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 40,
    party_ids: ['party-bjp', 'party-inc', 'party-others', 'party-nota'],
  },
  {
    id: 'sikkim',
    name_en: 'Sikkim',
    name_hi: 'सिक्किम',
    code: 'SK',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 32,
    party_ids: ['party-bjp', 'party-inc', 'party-others', 'party-nota'],
  },
  {
    id: 'arunachal-pradesh',
    name_en: 'Arunachal Pradesh',
    name_hi: 'अरुणाचल प्रदेश',
    code: 'AR',
    type: 'STATE',
    hasAssembly: true,
    assemblySeats: 60,
    party_ids: ['party-bjp', 'party-inc', 'party-jdu', 'party-others', 'party-nota'],
  },
];

export const STATE_CM_CANDIDATES: Record<string, Record<string, { en: string; hi: string }>> = {
  'uttar-pradesh': {
    'party-bjp': { en: 'Yogi Adityanath', hi: 'योगी आदित्यनाथ' },
    'party-sp': { en: 'Akhilesh Yadav', hi: 'अखिलेश यादव' },
    'party-bsp': { en: 'Mayawati', hi: 'मायावती' },
    'party-inc': { en: 'Ajay Rai', hi: 'अजय राय' },
  },
  'maharashtra': {
    'party-bjp': { en: 'Devendra Fadnavis', hi: 'देवेंद्र फडणवीस' },
    'party-shivsena': { en: 'Eknath Shinde', hi: 'एकनाथ शिंदे' },
    'party-shivsena_ubt': { en: 'Uddhav Thackeray', hi: 'उद्धव ठाकरे' },
    'party-ncp': { en: 'Ajit Pawar', hi: 'अजित पवार' },
    'party-ncp_sp': { en: 'Sharad Pawar Choice', hi: 'शरद पवार समर्थित प्रत्याशी' },
    'party-inc': { en: 'Nana Patole', hi: 'नाना पटोले' },
  },
  'west-bengal': {
    'party-tmc': { en: 'Mamata Banerjee', hi: 'ममता बनर्जी' },
    'party-bjp': { en: 'Suvendu Adhikari', hi: 'शुभेंदु अधिकारी' },
    'party-cpim': { en: 'Mohammed Salim', hi: 'मोहम्मद सलीम' },
    'party-inc': { en: 'Adhir Ranjan Chowdhury', hi: 'अधीर रंजन चौधरी' },
  },
  'bihar': {
    'party-jdu': { en: 'Nitish Kumar', hi: 'नीतीश कुमार' },
    'party-rjd': { en: 'Tejashwi Yadav', hi: 'तेजस्वी यादव' },
    'party-bjp': { en: 'Samrat Choudhary', hi: 'सम्राट चौधरी' },
    'party-ljp': { en: 'Chirag Paswan', hi: 'चिराग पासवान' },
    'party-inc': { en: 'Akhilesh Prasad Singh', hi: 'अखिलेश प्रसाद सिंह' },
  },
  'delhi': {
    'party-aap': { en: 'Arvind Kejriwal / Atishi', hi: 'अरविंद केजरीवाल / आतिशी' },
    'party-bjp': { en: 'Virendra Sachdeva', hi: 'वीरेंद्र सचदेवा' },
    'party-inc': { en: 'Devender Yadav', hi: 'देवेंद्र यादव' },
  },
  'tamil-nadu': {
    'party-dmk': { en: 'M. K. Stalin', hi: 'एम. के. स्टालिन' },
    'party-aiadmk': { en: 'Edappadi K. Palaniswami', hi: 'एडप्पाडी के. पलानीस्वामी' },
    'party-bjp': { en: 'K. Annamalai', hi: 'के. अन्नामलाई' },
    'party-inc': { en: 'K. Selvaperunthagai', hi: 'के. सेल्वापेरुन्थगई' },
  },
  'karnataka': {
    'party-inc': { en: 'Siddaramaiah / D. K. Shivakumar', hi: 'सिद्धारमैया / डी. के. शिवकुमार' },
    'party-bjp': { en: 'B. Y. Vijayendra', hi: 'बी. वाई. विजयेंद्र' },
    'party-jds': { en: 'H. D. Kumaraswamy', hi: 'एच. डी. कुमारस्वामी' },
  },
  'andhra-pradesh': {
    'party-tdp': { en: 'N. Chandrababu Naidu', hi: 'एन. चंद्रबाबू नायडू' },
    'party-ysrcp': { en: 'Y. S. Jagan Mohan Reddy', hi: 'वाई. एस. जगन मोहन रेड्डी' },
    'party-jsp': { en: 'Pawan Kalyan', hi: 'पवन कल्याण' },
  },
  'telangana': {
    'party-inc': { en: 'A. Revanth Reddy', hi: 'ए. रेवंत रेड्डी' },
    'party-brs': { en: 'K. Chandrashekar Rao (KCR)', hi: 'के. चंद्रशेखर राव' },
    'party-bjp': { en: 'G. Kishan Reddy', hi: 'जी. किशन रेड्डी' },
    'party-aimim': { en: 'Asaduddin Owaisi Choice', hi: 'असदुद्दीन ओवैसी समर्थित' },
  },
  'gujarat': {
    'party-bjp': { en: 'Bhupendra Patel', hi: 'भूपेंद्र पटेल' },
    'party-inc': { en: 'Shaktisinh Gohil', hi: 'शक्तिसिंह गोहिल' },
    'party-aap': { en: 'Isudan Gadhvi', hi: 'ईसुदान गढ़वी' },
  },
  'rajasthan': {
    'party-bjp': { en: 'Bhajan Lal Sharma', hi: 'भजन लाल शर्मा' },
    'party-inc': { en: 'Ashok Gehlot / Sachin Pilot', hi: 'अशोक गहलोत / सचिन पायलट' },
  },
  'madhya-pradesh': {
    'party-bjp': { en: 'Mohan Yadav', hi: 'मोहन यादव' },
    'party-inc': { en: 'Jitu Patwari / Kamal Nath', hi: 'जीतू पटवारी / कमल नाथ' },
  },
  'punjab': {
    'party-aap': { en: 'Bhagwant Mann', hi: 'भगवंत मान' },
    'party-inc': { en: 'Amarinder Singh Raja Warring', hi: 'अमरिंदर सिंह राजा वड़िंग' },
    'party-sad': { en: 'Sukhbir Singh Badal', hi: 'सुखबीर सिंह बादल' },
    'party-bjp': { en: 'Sunil Jakhar', hi: 'सुनील जाखड़' },
  },
  'odisha': {
    'party-bjp': { en: 'Mohan Charan Majhi', hi: 'मोहन चरण माझी' },
    'party-bjd': { en: 'Naveen Patnaik', hi: 'नवीन पटनायक' },
    'party-inc': { en: 'Sarat Pattanayak', hi: 'सरत पटनायक' },
  },
  'jharkhand': {
    'party-jmm': { en: 'Hemant Soren', hi: 'हेमंत सोरेन' },
    'party-bjp': { en: 'Babulal Marandi', hi: 'बाबूलाल मरांडी' },
    'party-inc': { en: 'Rajesh Thakur', hi: 'राजेश ठाकुर' },
  },
  'assam': {
    'party-bjp': { en: 'Himanta Biswa Sarma', hi: 'हिमंत बिस्वा सरमा' },
    'party-inc': { en: 'Bhupen Kumar Borah', hi: 'भूपेन कुमार बोरा' },
  },
  'kerala': {
    'party-cpim': { en: 'Pinarayi Vijayan', hi: 'पिनाराई विजयन' },
    'party-inc': { en: 'V. D. Satheesan / K. Sudhakaran', hi: 'वी. डी. सतीसन / के. सुधाकरन' },
    'party-bjp': { en: 'K. Surendran', hi: 'के. सुरेंद्रन' },
  },
  'haryana': {
    'party-bjp': { en: 'Nayab Singh Saini', hi: 'नायब सिंह सैनी' },
    'party-inc': { en: 'Bhupinder Singh Hooda', hi: 'भूपेंद्र सिंह हुड्डा' },
    'party-aap': { en: 'Sushil Gupta', hi: 'सुशील गुप्ता' },
  },
};

export const getCmCandidate = (
  partyId: string,
  stateId: string,
  partyNameEn?: string,
  partyNameHi?: string
): { en: string; hi: string } => {
  if (partyId === 'party-nota') {
    return { en: 'None of the Above', hi: 'इनमें से कोई नहीं' };
  }
  if (partyId === 'party-others') {
    return { en: 'Independent / Other CM Nominee', hi: 'निर्दलीय / अन्य मुख्यमंत्री प्रत्याशी' };
  }
  const stateCandidates = STATE_CM_CANDIDATES[stateId];
  if (stateCandidates && stateCandidates[partyId]) {
    return stateCandidates[partyId];
  }
  const cleanNameEn = (partyNameEn || partyId.replace('party-', '')).replace(/\(.*?\)/g, '').trim();
  const cleanNameHi = (partyNameHi || partyId.replace('party-', '')).replace(/\(.*?\)/g, '').trim();
  return {
    en: `${cleanNameEn} State Assembly CM Nominee`,
    hi: `${cleanNameHi} मुख्यमंत्री प्रत्याशी`,
  };
};

export const getPartyById = (id: string): Party | undefined => {
  return ALL_PARTIES.find((p) => p.id === id);
};

export const getStateById = (stateId: string): IndianState | undefined => {
  return INDIAN_STATES.find((s) => s.id === stateId || s.code.toLowerCase() === stateId.toLowerCase());
};

export const getPartiesForPM = (): Party[] => {
  return NATIONAL_PARTIES.map((party) => ({
    ...party,
    candidate_role_en: party.id === 'party-nota' ? 'Rejection Choice' : 'PM Candidate',
    candidate_role_hi: party.id === 'party-nota' ? 'अस्वीकृति विकल्प' : 'प्रधानमंत्री प्रत्याशी',
  }));
};

export const getPartiesForState = (stateId: string): Party[] => {
  const state = getStateById(stateId);
  const baseParties = state
    ? state.party_ids
        .map((pid) => getPartyById(pid))
        .filter((p): p is Party => Boolean(p))
    : NATIONAL_PARTIES;

  const list = baseParties.length > 0 ? baseParties : NATIONAL_PARTIES;

  return list.map((party) => {
    const cmCandidate = getCmCandidate(party.id, stateId, party.name_en, party.name_hi);
    return {
      ...party,
      candidate_name_en: cmCandidate.en,
      candidate_name_hi: cmCandidate.hi,
      candidate_role_en: party.id === 'party-nota' ? 'Rejection Choice' : 'CM Candidate',
      candidate_role_hi: party.id === 'party-nota' ? 'अस्वीकृति विकल्प' : 'मुख्यमंत्री प्रत्याशी',
    };
  });
};

