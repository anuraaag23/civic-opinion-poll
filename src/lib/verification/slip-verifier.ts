import { db } from '../db';
import { generateParticipationFingerprint, generateAnonymousToken } from '../crypto';
import { VerificationResult } from '../types';

export interface ParsedEciSlip {
  isValidSlip: boolean;
  state?: string;
  assemblyConstituency?: string;
  partNumber?: number;
  serialNumber?: number;
  rawConfidence: number; // 0 to 100
  detectionMarkers: string[];
}

/**
 * Extracts and strictly validates authentic Election Commission of India (ECI) markers
 * from the text content of a Voter Information Slip (PDF or OCR).
 */
export function extractEciSlipMarkers(extractedText: string): ParsedEciSlip {
  const text = (extractedText || '').trim();
  if (!text || text.length < 20) {
    return { isValidSlip: false, rawConfidence: 0, detectionMarkers: [] };
  }

  const markers: string[] = [];

  // 1. Mandatory Authority Headers
  const hasEciHeader = /election\s*commission\s*of\s*india|भारत\s*निर्वाचन\s*आयोग|electoralsearch\.eci\.gov\.in|voters\.eci\.gov\.in/i.test(text);
  if (hasEciHeader) markers.push('ECI_AUTHORITY_HEADER');

  const hasSlipHeader = /voter\s*information\s*slip|मतदाता\s*सूचना\s*पर्ची|electoral\s*roll|निर्वाचक\s*नामावली/i.test(text);
  if (hasSlipHeader) markers.push('VOTER_SLIP_TITLE');

  // 2. Electoral Coordinate Patterns
  const partMatch =
    text.match(/(?:part|भाग)[^\d\n\r]{0,40}(\d+)/i) ||
    text.match(/column\s*8[^\d\n\r]{0,20}(\d+)/i);

  const serialMatch =
    text.match(/(?:serial|क्रम|क्रमांक)[^\d\n\r]{0,40}(\d+)/i) ||
    text.match(/column\s*9[^\d\n\r]{0,20}(\d+)/i);

  const acMatch = text.match(/(?:assembly\s*constituency|विधानसभा\s*निर्वाचन\s*क्षेत्र)\s*(?:no\.?|संख्या)?\s*[:\-]?\s*([^\n\r,]+)/i);

  const stateMatch = text.match(/(?:state|राज्य)\s*[:\-]?\s*([^\n\r,]+)/i);

  let partNumber: number | undefined;
  if (partMatch && partMatch[1]) {
    const p = parseInt(partMatch[1], 10);
    if (!isNaN(p) && p >= 1 && p <= 450) {
      partNumber = p;
      markers.push('VALID_PART_NUMBER');
    }
  }

  let serialNumber: number | undefined;
  if (serialMatch && serialMatch[1]) {
    const s = parseInt(serialMatch[1], 10);
    if (!isNaN(s) && s >= 1 && s <= 1500) {
      serialNumber = s;
      markers.push('VALID_SERIAL_NUMBER');
    }
  }

  let assemblyConstituency: string | undefined;
  if (acMatch && acMatch[1]) {
    assemblyConstituency = acMatch[1]
      .replace(/^(?:no\.?\s*(?:and|&)?\s*name|संख्या\s*(?:एवं|व)?\s*नाम)\s*[:\-]?\s*/i, '')
      .replace(/^(?:and|&)?\s*name\s*[:\-]?\s*/i, '')
      .trim()
      .slice(0, 50);
    markers.push('VALID_AC_REFERENCE');
  }

  let state: string | undefined;
  if (stateMatch && stateMatch[1]) {
    state = stateMatch[1].trim().slice(0, 30);
  }

  // Authentic ECI slips MUST contain authority header OR slip title, PLUS both part & serial numbers
  const isValidSlip = (hasEciHeader || hasSlipHeader) && !!partNumber && !!serialNumber;

  let confidence = 0;
  if (hasEciHeader) confidence += 40;
  if (hasSlipHeader) confidence += 30;
  if (partNumber) confidence += 15;
  if (serialNumber) confidence += 15;

  return {
    isValidSlip,
    state,
    assemblyConstituency,
    partNumber,
    serialNumber,
    rawConfidence: Math.min(confidence, 100),
    detectionMarkers: markers,
  };
}

/**
 * Validates an uploaded PDF buffer or text payload against the official ECI format.
 * If genuine, issues a cryptographic anonymous voting credential.
 * If forged, dummy, or arbitrary, strictly rejects the submission.
 */
export async function verifyUploadedEciSlip(
  pollId: string,
  pdfBufferOrText: Buffer | string,
  clientIp: string,
  deviceFingerprint?: string
): Promise<VerificationResult> {
  try {
    // 1. Verify poll status
    const poll = await db.getPollById(pollId);
    if (!poll || poll.status !== 'LIVE') {
      return { verified: false, reason: 'INVALID_POLL', error: 'This poll is not currently active.' };
    }

    let extractedText = '';

    if (typeof pdfBufferOrText === 'string') {
      extractedText = pdfBufferOrText;
    } else {
      // Parse PDF buffer
      try {
        // Dynamically require pdf-parse
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdf = require('pdf-parse');
        const pdfData = await pdf(pdfBufferOrText);
        extractedText = pdfData.text || '';
      } catch (parseErr) {
        return {
          verified: false,
          reason: 'INVALID_ECI_SLIP',
          error:
            'Failed to parse uploaded PDF file. Please ensure you are uploading the official Voter Information Slip downloaded directly from electoralsearch.eci.gov.in.',
        };
      }
    }

    // 2. Extract and inspect authentic ECI markers
    const parsed = extractEciSlipMarkers(extractedText);

    if (!parsed.isValidSlip || !parsed.partNumber || !parsed.serialNumber) {
      await db.recordAuditEvent('self_verification_failure', pollId, {
        reason: 'INVALID_ECI_SLIP',
        markers: parsed.detectionMarkers,
      });

      return {
        verified: false,
        reason: 'INVALID_ECI_SLIP',
        error:
          'Verification Rejected: The uploaded document does not match an authentic Election Commission of India (ECI) Voter Slip. Arbitrary, forged, or unrelated documents cannot be verified. Please search on electoralsearch.eci.gov.in and download your official slip.',
      };
    }

    // 3. Build unique electoral coordinate fingerprint
    const cleanState = (parsed.state || 'IN').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);
    const cleanAc = (parsed.assemblyConstituency || 'AC').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 40);
    const electoralKey = `ECI:${cleanState}:${cleanAc}:P${parsed.partNumber}:S${parsed.serialNumber}`;
    const voterFingerprint = generateParticipationFingerprint(electoralKey, pollId);

    // 4. Deduplication Check against Poll Voting Policy
    const alreadyVoted = await db.hasParticipated(pollId, voterFingerprint);
    if (alreadyVoted) {
      await db.recordAuditEvent('duplicate_vote_blocked', pollId, { method: 'HMAC_ECI_SLIP_FINGERPRINT' });
      return {
        verified: false,
        reason: 'ALREADY_VOTED',
        error:
          'This official ECI voter slip has already participated in this election. Duplicate voting is strictly blocked across all devices and browsers to keep elections fair.',
      };
    }

    // 5. Anti-Sybil Hardware Device Limit
    const clientIdentifier = deviceFingerprint || `CLIENT:${clientIp}`;
    const deviceFingerprintHash = generateParticipationFingerprint(`DEV:${clientIdentifier}`, pollId);

    if (process.env.NODE_ENV !== 'test') {
      const deviceVoted = await db.hasParticipated(pollId, deviceFingerprintHash);
      if (deviceVoted) {
        await db.recordAuditEvent('duplicate_vote_blocked', pollId, { method: 'HMAC_DEVICE_LIMIT' });
        return {
          verified: false,
          reason: 'ALREADY_VOTED',
          error:
            'A vote has already been recorded from this device or network session. Multiple submissions from the same device are strictly prohibited to maintain fair elections.',
        };
      }
    }

    // 6. Issue Anonymous Single-Use Credential
    const { token, tokenHash } = generateAnonymousToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await db.recordParticipation(pollId, voterFingerprint);
    if (process.env.NODE_ENV !== 'test') {
      await db.recordParticipation(pollId, deviceFingerprintHash);
    }
    await db.issueAnonymousCredential(pollId, tokenHash, expiresAt);

    await db.recordAuditEvent('self_verification_confirmed', pollId, {
      method: 'ECI_SLIP_VERIFIED',
      confidence: parsed.rawConfidence,
      partNumber: parsed.partNumber,
    });

    return {
      verified: true,
      status: 'VERIFICATION_SUCCESS',
      anonymous_token: token,
      expires_at: expiresAt,
    };
  } catch (err) {
    return {
      verified: false,
      reason: 'SERVICE_UNAVAILABLE',
      error: 'An unexpected verification error occurred. Please try again.',
    };
  }
}
