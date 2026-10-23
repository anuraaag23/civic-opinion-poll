import { describe, it, expect } from 'vitest';
import { extractEciSlipMarkers, verifyUploadedEciSlip } from './slip-verifier';

describe('ECI Voter Slip Verifier', () => {
  const validPollId = 'poll-national-2029';

  const authenticSlipSample = `
    ELECTION COMMISSION OF INDIA
    भारत निर्वाचन आयोग
    VOTER INFORMATION SLIP (मतदाता सूचना पर्ची)
    electoralsearch.eci.gov.in
    State: S05 - Delhi (दिल्ली)
    Assembly Constituency No. and Name: 40 - New Delhi (नई दिल्ली)
    Part No. and Name: 142 - NDMC Community Hall
    Serial No: 389
    Polling Station: NDMC Community Centre, Babar Road
  `;

  const arbitraryDocumentSample = `
    INVOICE #98421
    Acme Software Corp
    Total: $450.00
    Customer Name: John Doe
    Address: 123 Main St
  `;

  const fakeHeaderOnlySample = `
    ELECTION COMMISSION OF INDIA
    This is an arbitrary document without any roll coordinates or slip titles.
  `;

  it('rejects completely arbitrary non-ECI documents', () => {
    const parsed = extractEciSlipMarkers(arbitraryDocumentSample);
    expect(parsed.isValidSlip).toBe(false);
    expect(parsed.detectionMarkers).toHaveLength(0);
  });

  it('rejects document with header but missing part/serial numbers', () => {
    const parsed = extractEciSlipMarkers(fakeHeaderOnlySample);
    expect(parsed.isValidSlip).toBe(false);
    expect(parsed.partNumber).toBeUndefined();
    expect(parsed.serialNumber).toBeUndefined();
  });

  it('accepts and extracts authentic ECI Voter Information Slip', () => {
    const parsed = extractEciSlipMarkers(authenticSlipSample);
    expect(parsed.isValidSlip).toBe(true);
    expect(parsed.partNumber).toBe(142);
    expect(parsed.serialNumber).toBe(389);
    expect(parsed.assemblyConstituency).toBe('40 - New Delhi (नई दिल्ली)');
    expect(parsed.detectionMarkers).toContain('ECI_AUTHORITY_HEADER');
    expect(parsed.detectionMarkers).toContain('VOTER_SLIP_TITLE');
    expect(parsed.detectionMarkers).toContain('VALID_PART_NUMBER');
    expect(parsed.detectionMarkers).toContain('VALID_SERIAL_NUMBER');
  });

  it('verifyUploadedEciSlip strictly rejects arbitrary non-ECI uploads', async () => {
    const result = await verifyUploadedEciSlip(validPollId, arbitraryDocumentSample, '127.0.0.1');
    expect(result.verified).toBe(false);
    expect(result.reason).toBe('INVALID_ECI_SLIP');
    expect(result.error).toContain('Verification Rejected');
  });

  it('verifyUploadedEciSlip verifies genuine ECI slip and generates credential', async () => {
    const result = await verifyUploadedEciSlip(validPollId, authenticSlipSample, '192.168.1.10', 'DEV_TEST_1');
    expect(result.verified).toBe(true);
    expect(result.status).toBe('VERIFICATION_SUCCESS');
    expect(result.anonymous_token).toBeDefined();
    expect(typeof result.anonymous_token).toBe('string');
  });

  it('verifyUploadedEciSlip blocks duplicate voting for the same slip', async () => {
    // Second submission with exact same slip
    const result2 = await verifyUploadedEciSlip(validPollId, authenticSlipSample, '192.168.1.11', 'DEV_TEST_2');
    expect(result2.verified).toBe(false);
    expect(result2.reason).toBe('ALREADY_VOTED');
    expect(result2.error).toContain('already participated');
  });
});
