/**
 * Bidirectional English <-> Hindi Civic & Political Translation Engine
 * Optimized for political party names, civic polls, titles, candidate names, and survey descriptions.
 */

// Phrase & Word level dictionaries
const PHRASE_PAIRS: [RegExp, string, RegExp, string][] = [
  // [English regex, Hindi replacement, Hindi regex, English replacement]
  [/\bChief Minister\b/gi, 'मुख्यमंत्री', /मुख्यमंत्री/g, 'Chief Minister'],
  [/\bPrime Minister\b/gi, 'प्रधानमंत्री', /प्रधानमंत्री/g, 'Prime Minister'],
  [/\bCivic Opinion Poll\b/gi, 'नागरिक जनमत सर्वेक्षण', /नागरिक जनमत सर्वेक्षण/g, 'Civic Opinion Poll'],
  [/\bOpinion Poll\b/gi, 'जनमत सर्वेक्षण', /जनमत सर्वेक्षण/g, 'Opinion Poll'],
  [/\bPublic Opinion\b/gi, 'जनमत', /जनमत/g, 'Public Opinion'],
  [/\bLok Sabha Election\b/gi, 'लोकसभा चुनाव', /लोकसभा चुनाव/g, 'Lok Sabha Election'],
  [/\bAssembly Election\b/gi, 'विधानसभा चुनाव', /विधानसभा चुनाव/g, 'Assembly Election'],
  [/\bLok Sabha\b/gi, 'लोकसभा', /लोकसभा/g, 'Lok Sabha'],
  [/\bVidhan Sabha\b/gi, 'विधानसभा', /विधानसभा/g, 'Vidhan Sabha'],
  [/\bState Assembly\b/gi, 'राज्य विधानसभा', /राज्य विधानसभा/g, 'State Assembly'],
  [/\bUnion Territory\b/gi, 'केंद्र शासित प्रदेश', /केंद्र शासित प्रदेश/g, 'Union Territory'],
  [/\bNational Level\b/gi, 'राष्ट्रीय स्तर', /राष्ट्रीय स्तर/g, 'National Level'],
  [/\bState Level\b/gi, 'राज्य स्तर', /राज्य स्तर/g, 'State Level'],
  [/\bAll India\b/gi, 'संपूर्ण भारत', /संपूर्ण भारत/g, 'All India'],
  [/\bPolitical Party\b/gi, 'राजनीतिक पार्टी', /राजनीतिक पार्टी/g, 'Political Party'],
  [/\bOfficial Symbol\b/gi, 'आधिकारिक चुनाव चिह्न', /आधिकारिक चुनाव चिह्न/g, 'Official Symbol'],
  [/\bElection Symbol\b/gi, 'चुनाव चिह्न', /चुनाव चिह्न/g, 'Election Symbol'],
  [/\bContesting Candidate\b/gi, 'प्रत्याशी / उम्मीदवार', /प्रत्याशी \/ उम्मीदवार/g, 'Contesting Candidate'],
  [/\bWho should be\b/gi, 'कौन होना चाहिए', /कौन होना चाहिए/g, 'Who should be'],
  [/\bNext Chief Minister\b/gi, 'अगला मुख्यमंत्री', /अगला मुख्यमंत्री/g, 'Next Chief Minister'],
  [/\bNext Prime Minister\b/gi, 'अगला प्रधानमंत्री', /अगला प्रधानमंत्री/g, 'Next Prime Minister'],
  [/\bAam Aadmi Party\b/gi, 'आम आदमी पार्टी (AAP)', /आम आदमी पार्टी/g, 'Aam Aadmi Party'],
  [/\bBharatiya Janata Party\b/gi, 'भारतीय जनता पार्टी (BJP)', /भारतीय जनता पार्टी/g, 'Bharatiya Janata Party'],
  [/\bIndian National Congress\b/gi, 'भारतीय राष्ट्रीय कांग्रेस (INC)', /भारतीय राष्ट्रीय कांग्रेस/g, 'Indian National Congress'],
  [/\bSamajwadi Party\b/gi, 'समाजवादी पार्टी (SP)', /समाजवादी पार्टी/g, 'Samajwadi Party'],
  [/\bBahujan Samaj Party\b/gi, 'बहुजन समाज पार्टी (BSP)', /बहुजन समाज पार्टी/g, 'Bahujan Samaj Party'],
  [/\bRashtriya Janata Dal\b/gi, 'राष्ट्रीय जनता दल (RJD)', /राष्ट्रीय जनता दल/g, 'Rashtriya Janata Dal'],
  [/\bJanata Dal\b/gi, 'जनता दल', /जनता दल/g, 'Janata Dal'],
  [/\bTrinamool Congress\b/gi, 'तृणमूल कांग्रेस (TMC)', /तृणमूल कांग्रेस/g, 'Trinamool Congress'],
  [/\bShiv Sena\b/gi, 'शिवसेना (SS)', /शिवसेना/g, 'Shiv Sena'],
  [/\bNationalist Congress Party\b/gi, 'राष्ट्रवादी कांग्रेस पार्टी (NCP)', /राष्ट्रवादी कांग्रेस पार्टी/g, 'Nationalist Congress Party'],
];

const EN_TO_HI_WORDS: Record<string, string> = {
  // Common civic & electoral words
  'poll': 'सर्वेक्षण',
  'polls': 'सर्वेक्षण',
  'vote': 'वोट',
  'votes': 'वोट',
  'voter': 'मतदाता',
  'voters': 'मतदाता',
  'voting': 'मतदान',
  'election': 'चुनाव',
  'elections': 'चुनाव',
  'assembly': 'विधानसभा',
  'parliament': 'संसद',
  'parliamentary': 'संसदीय',
  'minister': 'मंत्री',
  'ministry': 'मंत्रालय',
  'government': 'सरकार',
  'party': 'पार्टी',
  'parties': 'पार्टियां',
  'candidate': 'उम्मीदवार',
  'candidates': 'उम्मीदवार',
  'citizen': 'नागरिक',
  'citizens': 'नागरिक',
  'survey': 'सर्वेक्षण',
  'surveys': 'सर्वेक्षण',
  'results': 'परिणाम',
  'result': 'परिणाम',
  'standings': 'स्थिति',
  'leader': 'नेता',
  'leaders': 'नेता',
  'leadership': 'नेतृत्व',
  'national': 'राष्ट्रीय',
  'state': 'राज्य',
  'states': 'राज्य',
  'district': 'ज़िला',
  'districts': 'ज़िले',
  'constituency': 'निर्वाचन क्षेत्र',
  'constituencies': 'निर्वाचन क्षेत्र',
  'seat': 'सीट',
  'seats': 'सीटें',
  'independent': 'निर्दलीय',
  'independents': 'निर्दलीय',
  'alliance': 'गठबंधन',
  'coalition': 'महागठबंधन',
  'front': 'मोर्चा',
  'morcha': 'मोर्चा',
  'dal': 'दल',
  'sena': 'सेना',
  'samaj': 'समाज',
  'vikas': 'विकास',
  'nyay': 'न्याय',
  'swaraj': 'स्वराज',
  'shakti': 'शक्ति',
  'raksha': 'रक्षा',
  'suraksha': 'सुरक्षा',
  'janata': 'जनता',
  'lok': 'लोक',
  'rashtriya': 'राष्ट्रीय',
  'bharatiya': 'भारतीय',
  'hindustan': 'हिंदुस्तान',
  'bharat': 'भारत',
  'india': 'भारत',
  'indian': 'भारतीय',
  'democratic': 'लोकतांत्रिक',
  'democracy': 'लोकतंत्र',
  'secular': 'धर्मनिरपेक्ष',
  'socialist': 'समाजवादी',
  'communist': 'कम्युनिस्ट',
  'marxist': 'मार्क्सवादी',
  'revolutionary': 'क्रांतिकारी',
  'progressive': 'प्रगतिशील',
  'united': 'संयुक्त',
  'people': 'लोग',
  'peoples': 'जनता',
  'youth': 'युवा',
  'kisan': 'किसान',
  'mazdoor': 'मजदूर',
  'shramik': 'श्रमिक',
  'women': 'महिलाएं',
  'public': 'जनता',
  'choice': 'पसंद',
  'choices': 'विकल्प',
  'option': 'विकल्प',
  'options': 'विकल्प',
  'live': 'लाइव',
  'upcoming': 'आगामी',
  'closed': 'समाप्त',
  'active': 'सक्रिय',
  'draft': 'प्रारूप',
  'scheduled': 'अनुसूचित',
  'verified': 'सत्यापित',
  'anonymous': 'गुमनाम',
  'security': 'सुरक्षा',
  'privacy': 'गोपनीयता',
  'governance': 'सुशासन',
  'development': 'विकास',
  'future': 'भविष्य',
  'who': 'कौन',
  'should': 'चाहिए',
  'next': 'अगला',
  'best': 'सर्वश्रेष्ठ',
  'for': 'के लिए',
  'in': 'में',
  'of': 'का',
  'and': 'और',
  'the': '',
  'a': '',
  'an': '',
  'is': 'है',
  'are': 'हैं',

  // Major states
  'delhi': 'दिल्ली',
  'uttar': 'उत्तर',
  'pradesh': 'प्रदेश',
  'bihar': 'बिहार',
  'maharashtra': 'महाराष्ट्र',
  'punjab': 'पंजाब',
  'haryana': 'हरियाणा',
  'rajasthan': 'राजस्थान',
  'gujarat': 'गुजरात',
  'madhya': 'मध्य',
  'karnataka': 'कर्नाटक',
  'kerala': 'केरल',
  'tamil': 'तमिल',
  'nadu': 'नाडु',
  'andhra': 'आंध्र',
  'telangana': 'तेलंगाना',
  'bengal': 'बंगाल',
  'west': 'पश्चिम',
  'odisha': 'ओडिशा',
  'jharkhand': 'झारखंड',
  'chhattisgarh': 'छत्तीसगढ़',
  'assam': 'असम',
  'himachal': 'हिमाचल',
  'uttarakhand': 'उत्तराखंड',
  'goa': 'गोवा',
  'jammu': 'जम्मू',
  'kashmir': 'कश्मीर',
  'ladakh': 'लद्दाख',

  // Recognized parties & movements
  'bjp': 'भाजपा (BJP)',
  'inc': 'कांग्रेस (INC)',
  'aap': 'आप (AAP)',
  'bsp': 'बसपा (BSP)',
  'sp': 'सपा (SP)',
  'cpi': 'भाकपा (CPI)',
  'cpim': 'माकपा (CPI-M)',
  'tmc': 'तृणमूल कांग्रेस (TMC)',
  'ncp': 'राकांपा (NCP)',
  'ss': 'शिवसेना (SS)',
  'rjd': 'राजद (RJD)',
  'jdu': 'जदयू (JDU)',
  'dmk': 'द्रमुक (DMK)',
  'aiadmk': 'अन्नाद्रमुक (AIADMK)',
  'tdp': 'तेदेपा (TDP)',
  'ysrcp': 'वाईएसआरसीपी (YSRCP)',
  'bjd': 'बीजद (BJD)',
  'jmm': 'झामुमो (JMM)',
  'brs': 'बीआरएस (BRS)',
  'krpp': 'केआरपीपी (KRPP)',
  'asp': 'आज़ाद समाज पार्टी (ASP)',
  'aimim': 'एआईएमआईएम (AIMIM)',
  'nota': 'नोटा (NOTA)',
  'others': 'अन्य',
  'other': 'अन्य',
};

// Inverted dictionary for Hindi to English
const HI_TO_EN_WORDS: Record<string, string> = {};
Object.entries(EN_TO_HI_WORDS).forEach(([en, hi]) => {
  if (hi && !HI_TO_EN_WORDS[hi]) {
    HI_TO_EN_WORDS[hi] = en.charAt(0).toUpperCase() + en.slice(1);
  }
});

// Explicit Hindi to English additions
const EXTRA_HI_TO_EN: Record<string, string> = {
  'सर्वेक्षण': 'Poll',
  'जनमत': 'Public Opinion',
  'मतदान': 'Voting',
  'मतदाता': 'Voter',
  'वोट': 'Vote',
  'चुनाव': 'Election',
  'पार्टी': 'Party',
  'पार्टियां': 'Parties',
  'उम्मीदवार': 'Candidate',
  'प्रत्याशी': 'Contestant',
  'नागरिक': 'Citizen',
  'परिणाम': 'Results',
  'स्थिति': 'Standings',
  'नेता': 'Leader',
  'राष्ट्रीय': 'National',
  'राज्य': 'State',
  'विधानसभा': 'Assembly',
  'लोकसभा': 'Lok Sabha',
  'मुख्यमंत्री': 'Chief Minister',
  'प्रधानमंत्री': 'Prime Minister',
  'निर्दलीय': 'Independent',
  'गठबंधन': 'Alliance',
  'मोर्चा': 'Front',
  'दल': 'Dal',
  'सेना': 'Sena',
  'समाजवादी': 'Samajwadi',
  'लोकतांत्रिक': 'Democratic',
  'लोकतंत्र': 'Democracy',
  'धर्मनिरपेक्ष': 'Secular',
  'विकास': 'Development',
  'न्याय': 'Justice',
  'सुरक्षा': 'Safety',
  'गोपनीयता': 'Privacy',
  'विकल्प': 'Option',
  'लाइव': 'Live',
  'आगामी': 'Upcoming',
  'समाप्त': 'Closed',
  'प्रारूप': 'Draft',
  'सत्यापित': 'Verified',
  'गुमनाम': 'Anonymous',
  'दिल्ली': 'Delhi',
  'उत्तर प्रदेश': 'Uttar Pradesh',
  'बिहार': 'Bihar',
  'महाराष्ट्र': 'Maharashtra',
  'पंजाब': 'Punjab',
  'हरियाणा': 'Haryana',
  'राजस्थान': 'Rajasthan',
  'गुजरात': 'Gujarat',
  'मध्य प्रदेश': 'Madhya Pradesh',
  'कर्नाटक': 'Karnataka',
  'केरल': 'Kerala',
  'तमिलनाडु': 'Tamil Nadu',
  'आंध्र प्रदेश': 'Andhra Pradesh',
  'तेलंगाना': 'Telangana',
  'पश्चिम बंगाल': 'West Bengal',
  'ओडिशा': 'Odisha',
  'झारखंड': 'Jharkhand',
  'छत्तीसगढ़': 'Chhattisgarh',
  'असम': 'Assam',
  'उत्तराखंड': 'Uttarakhand',
  'गोवा': 'Goa',
  'अन्य': 'Others',
  'और': 'and',
  'में': 'in',
  'के लिए': 'for',
  'का': 'of',
  'की': 'of',
  'के': 'of',
};
Object.assign(HI_TO_EN_WORDS, EXTRA_HI_TO_EN);

// Phonetic transliteration table: English Latin letter combinations -> Devanagari
const PHONETIC_EN_TO_HI: [RegExp, string][] = [
  [/ksh/gi, 'क्ष'],
  [/tra/gi, 'त्र'],
  [/gya/gi, 'ज्ञ'],
  [/shri/gi, 'श्री'],
  [/ch/gi, 'च'],
  [/sh/gi, 'श'],
  [/th/gi, 'थ'],
  [/dh/gi, 'ध'],
  [/bh/gi, 'भ'],
  [/gh/gi, 'घ'],
  [/kh/gi, 'ख'],
  [/ph/gi, 'फ'],
  [/jh/gi, 'झ'],
  [/ee/gi, 'ी'],
  [/oo/gi, 'ू'],
  [/ai/gi, 'ै'],
  [/au/gi, 'ौ'],
  [/aa/gi, 'ा'],
  [/a/gi, 'ा'],
  [/i/gi, 'ि'],
  [/u/gi, 'ु'],
  [/e/gi, 'े'],
  [/o/gi, 'ो'],
  [/k/gi, 'क'],
  [/g/gi, 'ग'],
  [/c/gi, 'क'],
  [/j/gi, 'ज'],
  [/t/gi, 'त'],
  [/d/gi, 'द'],
  [/n/gi, 'न'],
  [/p/gi, 'प'],
  [/f/gi, 'फ'],
  [/b/gi, 'ब'],
  [/m/gi, 'म'],
  [/y/gi, 'य'],
  [/r/gi, 'र'],
  [/l/gi, 'ल'],
  [/v/gi, 'व'],
  [/w/gi, 'व'],
  [/s/gi, 'स'],
  [/h/gi, 'ह'],
  [/z/gi, 'ज़'],
];

// Devanagari character to Latin phonetic transliteration
const DEVANAGARI_TO_LATIN: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tra', 'ज्ञ': 'gya', 'श्र': 'shri',
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n',
  '्': '',
};

/**
 * Transliterates an unknown English word to Hindi phonetically.
 */
function transliterateWordEnToHi(word: string): string {
  if (!word) return '';
  // Check if it's already Devanagari
  if (/[\u0900-\u097F]/.test(word)) return word;
  // If it's a number, preserve it
  if (/^\d+$/.test(word)) return word;

  let result = word;
  for (const [regex, replacement] of PHONETIC_EN_TO_HI) {
    result = result.replace(regex, replacement);
  }
  return result;
}

/**
 * Transliterates an unknown Hindi word to English phonetically.
 */
function transliterateWordHiToEn(word: string): string {
  if (!word) return '';
  // Check if it's already English Latin
  if (/^[a-zA-Z0-9\s.,!?-]+$/.test(word)) return word;

  let latin = '';
  for (const char of word) {
    latin += DEVANAGARI_TO_LATIN[char] || char;
  }
  return latin ? latin.charAt(0).toUpperCase() + latin.slice(1) : word;
}

/**
 * Automatically translates English text into Hindi.
 * Handles phrases, vocabulary lookups, and phonetic transliteration.
 */
export function translateEnToHi(text: string): string {
  if (!text || !text.trim()) return '';

  let output = text;

  // 1. Process multi-word phrases first
  for (const [enRegex, hiReplacement] of PHRASE_PAIRS) {
    output = output.replace(enRegex, hiReplacement);
  }

  // 2. Process words that remain in English
  const tokens = output.split(/(\s+|[.,/#!$%^&*;:{}=\-_`~()])/);
  const translated = tokens.map((token) => {
    if (!token || /^\s+$/.test(token) || /^[.,/#!$%^&*;:{}=\-_`~()]+$/.test(token)) {
      return token;
    }
    // Check if token is already Devanagari
    if (/[\u0900-\u097F]/.test(token)) {
      return token;
    }
    // Check dictionary
    const lower = token.toLowerCase();
    if (EN_TO_HI_WORDS[lower]) {
      return EN_TO_HI_WORDS[lower];
    }
    // If numeric (e.g. 2029)
    if (/^\d+$/.test(token)) {
      return token;
    }
    // Fallback phonetic transliteration for proper names / custom parties
    return transliterateWordEnToHi(token);
  });

  return translated.join('').replace(/\s+/g, ' ').trim();
}

/**
 * Automatically translates Hindi text into English.
 * Handles phrases, vocabulary lookups, and phonetic transliteration.
 */
export function translateHiToEn(text: string): string {
  if (!text || !text.trim()) return '';

  let output = text;

  // 1. Process multi-word phrases first
  for (const [, , hiRegex, enReplacement] of PHRASE_PAIRS) {
    output = output.replace(hiRegex, enReplacement);
  }

  // 2. Check full phrase matches from EXTRA_HI_TO_EN
  for (const [hiPhrase, enPhrase] of Object.entries(EXTRA_HI_TO_EN)) {
    if (output.includes(hiPhrase)) {
      output = output.split(hiPhrase).join(enPhrase);
    }
  }

  // 3. Process remaining tokens
  const tokens = output.split(/(\s+|[.,/#!$%^&*;:{}=\-_`~()])/);
  const translated = tokens.map((token) => {
    if (!token || /^\s+$/.test(token) || /^[.,/#!$%^&*;:{}=\-_`~()]+$/.test(token)) {
      return token;
    }
    // Check if token is already Latin English
    if (/^[a-zA-Z0-9]+$/.test(token)) {
      return token;
    }
    // Check dictionary
    if (HI_TO_EN_WORDS[token]) {
      return HI_TO_EN_WORDS[token];
    }
    // Fallback phonetic transliteration
    return transliterateWordHiToEn(token);
  });

  return translated.join('').replace(/\s+/g, ' ').trim();
}
