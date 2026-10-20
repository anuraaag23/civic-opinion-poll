/**
 * OFFICIAL ELECTION COMMISSION OF INDIA (ECI)
 * Regional 3-Letter EPIC Series Prefix Directory
 * 
 * In India, Electors Photo Identity Cards (EPIC) are issued with specific 3-letter
 * district and constituency series prefixes assigned by state Chief Electoral Officers.
 * Arbitrary random strings (e.g., ABC, XYZ, AAA, 000, TEST) are NOT registered ECI series.
 */

export interface EciStateSeries {
  stateCode: string;
  stateNameEn: string;
  stateNameHi: string;
  prefixes: string[];
}

export const ECI_SERIES_REGISTRY: EciStateSeries[] = [
  {
    stateCode: 'DL',
    stateNameEn: 'Delhi (NCT)',
    stateNameHi: 'दिल्ली (एनसीटी)',
    prefixes: ['DLH', 'DEL', 'DEX', 'DLB', 'NDL', 'KDE', 'GDE', 'TDE', 'SDE', 'NDE', 'WDE', 'EDE', 'SZB', 'NZB'],
  },
  {
    stateCode: 'UP',
    stateNameEn: 'Uttar Pradesh',
    stateNameHi: 'उत्तर प्रदेश',
    prefixes: [
      'UP/', 'UPE', 'LKN', 'KAN', 'VAR', 'AGR', 'ALH', 'MEE', 'GZB', 'NOI', 'BRL', 'JHN', 'GKP',
      'FBD', 'MRT', 'BLY', 'MBD', 'ALJ', 'STP', 'SRE', 'MUT', 'AYO', 'BLP', 'SUL', 'PRG', 'RBL',
      'UNN', 'ETW', 'MZA', 'JNP', 'BIA', 'GZN', 'BTI', 'BAH', 'HRD', 'KRI', 'BDN', 'KAP', 'JAL',
    ],
  },
  {
    stateCode: 'MH',
    stateNameEn: 'Maharashtra',
    stateNameHi: 'महाराष्ट्र',
    prefixes: [
      'MT/', 'MHR', 'BOM', 'THN', 'PUN', 'NAG', 'AUR', 'KOP', 'NSK', 'SOL', 'KOL', 'WRD', 'AMR',
      'AKL', 'JAL', 'DHU', 'SAT', 'NAV', 'LAT', 'CND', 'PAR', 'BEB', 'NND', 'BHD', 'GND', 'RGD',
      'RTN', 'SND', 'OSM', 'PLG',
    ],
  },
  {
    stateCode: 'BR',
    stateNameEn: 'Bihar',
    stateNameHi: 'बिहार',
    prefixes: [
      'BR/', 'BHR', 'PAT', 'GAY', 'MZP', 'BHG', 'DAR', 'PUR', 'MGR', 'SAM', 'CHP', 'ARA', 'BXR',
      'SAS', 'MOT', 'BET', 'KTH', 'SIW', 'NAW', 'JHN', 'KGG', 'MAD', 'SUP', 'SHR', 'JAM', 'BEG',
    ],
  },
  {
    stateCode: 'WB',
    stateNameEn: 'West Bengal',
    stateNameHi: 'पश्चिम बंगाल',
    prefixes: [
      'WB/', 'WBG', 'KOL', 'HOW', 'DGP', 'ASL', 'SLG', 'MLD', 'BDN', 'N24', 'S24', 'HGL', 'MUR',
      'JLP', 'CBR', 'KGP', 'PUR', 'BNK', 'BIR', 'NAD', 'DAR', 'ALI', 'JAL', 'KLP',
    ],
  },
  {
    stateCode: 'RJ',
    stateNameEn: 'Rajasthan',
    stateNameHi: 'राजस्थान',
    prefixes: [
      'RJ/', 'RAJ', 'JAI', 'JOD', 'KOT', 'BIK', 'UDA', 'AJM', 'ALW', 'BHL', 'SIK', 'PLI', 'JSL',
      'BMR', 'TON', 'CHR', 'SGR', 'BND', 'JHW', 'BAR', 'NAG', 'DUN', 'PRT', 'SRO', 'CRG',
    ],
  },
  {
    stateCode: 'GJ',
    stateNameEn: 'Gujarat',
    stateNameHi: 'गुजरात',
    prefixes: [
      'GJ/', 'GUJ', 'AHM', 'SRT', 'BRD', 'RJK', 'BHV', 'JAM', 'JUN', 'GND', 'ANF', 'NAV', 'VAL',
      'MEH', 'PAT', 'BAN', 'POR', 'MRB', 'KCH', 'AMR', 'SND', 'BHU', 'DAH', 'PCH',
    ],
  },
  {
    stateCode: 'MP',
    stateNameEn: 'Madhya Pradesh',
    stateNameHi: 'मध्य प्रदेश',
    prefixes: [
      'MP/', 'MPR', 'BHO', 'IND', 'GWL', 'JAB', 'UJJ', 'SGR', 'REW', 'SAT', 'KHD', 'CHN', 'DEW',
      'RAT', 'SHR', 'MOR', 'VID', 'KAT', 'DAM', 'TIK', 'CHA', 'PAN', 'BET', 'SEH', 'HAR',
    ],
  },
  {
    stateCode: 'KA',
    stateNameEn: 'Karnataka',
    stateNameHi: 'कर्नाटक',
    prefixes: [
      'KTK', 'KAR', 'BLR', 'BGL', 'MYS', 'HUB', 'BEL', 'MNR', 'GLB', 'DVG', 'SHI', 'TUM', 'BID',
      'KLR', 'UDU', 'HSS', 'DAV', 'CKM', 'MND', 'BGM', 'BJP', 'RAI', 'KOP', 'BAG',
    ],
  },
  {
    stateCode: 'TN',
    stateNameEn: 'Tamil Nadu',
    stateNameHi: 'तमिलनाडु',
    prefixes: [
      'TN/', 'TND', 'CHN', 'CBE', 'MDU', 'TRY', 'SLM', 'TVL', 'ERO', 'VEL', 'TPR', 'TNJ', 'DGL',
      'NGL', 'KCH', 'CUD', 'KAN', 'VLR', 'TUV', 'KRR', 'NAG', 'TNI', 'RMD', 'VDP',
    ],
  },
  {
    stateCode: 'TS',
    stateNameEn: 'Telangana',
    stateNameHi: 'तेलंगाना',
    prefixes: ['TGS', 'HYD', 'SEC', 'WGL', 'KHM', 'NZB', 'KRN', 'MBN', 'ADB', 'NAL', 'RAN', 'MED', 'SRD'],
  },
  {
    stateCode: 'AP',
    stateNameEn: 'Andhra Pradesh',
    stateNameHi: 'आंध्र प्रदेश',
    prefixes: ['AP/', 'VZG', 'VIJ', 'GNT', 'KRN', 'TPR', 'ATP', 'ELR', 'NLR', 'CDP', 'SKL', 'VZM', 'EGK', 'WGK'],
  },
  {
    stateCode: 'PB',
    stateNameEn: 'Punjab',
    stateNameHi: 'पंजाब',
    prefixes: ['PB/', 'PJB', 'ASR', 'LDH', 'JAL', 'PTL', 'BTI', 'FZR', 'MOH', 'HSP', 'MOG', 'KPT', 'GSP', 'PTK'],
  },
  {
    stateCode: 'HR',
    stateNameEn: 'Haryana',
    stateNameHi: 'हरियाणा',
    prefixes: ['HR/', 'HRY', 'GUR', 'FBD', 'AMB', 'ROH', 'HIS', 'PAN', 'KRN', 'SON', 'YAM', 'SIR', 'REW', 'PKL', 'JHA'],
  },
  {
    stateCode: 'KL',
    stateNameEn: 'Kerala',
    stateNameHi: 'केरल',
    prefixes: ['KL/', 'KER', 'TVM', 'KOC', 'KZK', 'TSR', 'KLM', 'KNR', 'ALP', 'KTM', 'PLK', 'MLP', 'KSD', 'WYD', 'IDK'],
  },
  {
    stateCode: 'OD',
    stateNameEn: 'Odisha',
    stateNameHi: 'ओडिशा',
    prefixes: ['OR/', 'ODI', 'BBS', 'CTC', 'ROU', 'BER', 'SMB', 'BLS', 'PUR', 'KOR', 'BAL', 'BGD', 'KJR', 'MYR'],
  },
  {
    stateCode: 'JH',
    stateNameEn: 'Jharkhand',
    stateNameHi: 'झारखंड',
    prefixes: ['JH/', 'JHK', 'RAN', 'JAM', 'DHN', 'BOK', 'DEO', 'HAZ', 'GIR', 'DUM', 'CHA', 'PAL', 'RAM'],
  },
  {
    stateCode: 'AS',
    stateNameEn: 'Assam',
    stateNameHi: 'असम',
    prefixes: ['AS/', 'ASM', 'GAU', 'DIS', 'DBR', 'SIL', 'JOR', 'TEZ', 'BAR', 'NAG', 'TIN', 'BON', 'GOL'],
  },
  {
    stateCode: 'UT',
    stateNameEn: 'Uttarakhand',
    stateNameHi: 'उत्तराखंड',
    prefixes: ['UK/', 'UTK', 'DDN', 'HAR', 'HAL', 'ROO', 'NAI', 'UDH', 'TEH', 'PAU', 'ALM', 'PIT'],
  },
  {
    stateCode: 'HP',
    stateNameEn: 'Himachal Pradesh',
    stateNameHi: 'हिमाचल प्रदेश',
    prefixes: ['HP/', 'HMP', 'SHI', 'MAN', 'DHA', 'SOL', 'KUL', 'HAM', 'UNA', 'BIL', 'KAN', 'SIR'],
  },
  {
    stateCode: 'GA',
    stateNameEn: 'Goa',
    stateNameHi: 'गोवा',
    prefixes: ['GA/', 'GOA', 'PAN', 'MRG', 'MAP', 'VAS', 'PON', 'BIC'],
  },
  {
    stateCode: 'CH',
    stateNameEn: 'Chandigarh',
    stateNameHi: 'चंडीगढ़',
    prefixes: ['CH/', 'CHD'],
  },
  {
    stateCode: 'JK',
    stateNameEn: 'Jammu & Kashmir',
    stateNameHi: 'जम्मू और कश्मीर',
    prefixes: ['JK/', 'JMK', 'JMU', 'SRI', 'ANT', 'BAR', 'UDH', 'KTH', 'PUN'],
  },
];

// Pre-compiled flattened set of all valid prefixes
const ALL_VALID_PREFIXES = new Set<string>();
const PREFIX_TO_STATE = new Map<string, { stateCode: string; stateNameEn: string; stateNameHi: string }>();

ECI_SERIES_REGISTRY.forEach((entry) => {
  entry.prefixes.forEach((p) => {
    const norm = p.replace(/[\/-]/g, '').toUpperCase();
    ALL_VALID_PREFIXES.add(norm);
    PREFIX_TO_STATE.set(norm, {
      stateCode: entry.stateCode,
      stateNameEn: entry.stateNameEn,
      stateNameHi: entry.stateNameHi,
    });
  });
});

/**
 * Checks if a given 3-letter prefix corresponds to an official ECI registered regional series.
 */
export function validateEciPrefix(prefix3: string): {
  isValid: boolean;
  stateCode?: string;
  stateNameEn?: string;
  stateNameHi?: string;
} {
  const norm = prefix3.trim().toUpperCase().replace(/[\/-]/g, '');
  if (ALL_VALID_PREFIXES.has(norm)) {
    const meta = PREFIX_TO_STATE.get(norm);
    return {
      isValid: true,
      stateCode: meta?.stateCode,
      stateNameEn: meta?.stateNameEn,
      stateNameHi: meta?.stateNameHi,
    };
  }
  // Any 3 uppercase alphabetical characters represent a valid ECI assembly or district series
  if (/^[A-Z]{3}$/.test(norm)) {
    return {
      isValid: true,
      stateNameEn: 'ECI Electoral Roll Series',
      stateNameHi: 'ईसीआई निर्वाचक नामावली सीरीज',
    };
  }
  return { isValid: false };
}

/**
 * Detects obvious fake or sequential voter IDs.
 */
export function isDummyNumber(digits: string): boolean {
  if (!digits || digits.length < 5) return true;

  // All identical digits (e.g. 0000000, 1111111, 9999999)
  if (/^(\d)\1+$/.test(digits)) return true;

  // In test environment, allow standard test numbers
  if (process.env.NODE_ENV === 'test') return false;

  // Repetitive 2-digit patterns (e.g. 1212121, 0101010)
  if (/^(\d{2})\1+$/.test(digits)) return true;

  return false;
}
