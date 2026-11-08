/**
 * =========================================================================
 * SIMULATED AADHAAR VERIFICATION SERVICE (MOCK PROVIDER)
 * =========================================================================
 * IMPORTANT NOTICE:
 * Replace with an authorized provider in production (e.g. UIDAI AUA/KUA
 * licensed gateway, DigiLocker API, or an authorized eKYC aggregator).
 *
 * PRIVACY & COMPLIANCE WARNING:
 * - NEVER store, persist, or log the raw 12-digit Aadhaar number anywhere.
 * - This file contains purely fictional identities for sandbox demonstration.
 * =========================================================================
 */

// 10 Hardcoded fictional test identities for sandbox verification
const MOCK_AADHAAR_IDENTITIES = [
  { aadhaar: '999911112222', name: 'Rajesh Kumar', state: 'Maharashtra' },
  { aadhaar: '999922223333', name: 'Priya Sharma', state: 'Delhi' },
  { aadhaar: '999933334444', name: 'Amit Patel', state: 'Gujarat' },
  { aadhaar: '999944445555', name: 'Sunita Devi', state: 'Uttar Pradesh' },
  { aadhaar: '999955556666', name: 'Vikram Singh', state: 'Rajasthan' },
  { aadhaar: '999966667777', name: 'Ananya Rao', state: 'Karnataka' },
  { aadhaar: '999977778888', name: 'Mohammed Irfan', state: 'Telangana' },
  { aadhaar: '999988889999', name: 'Pooja Verma', state: 'Madhya Pradesh' },
  { aadhaar: '999900001111', name: 'Suresh Menon', state: 'Kerala' },
  { aadhaar: '999912345678', name: 'Kavita Nair', state: 'Tamil Nadu' }
];

/**
 * Validates whether the provided number matches a mock identity
 * @param {string} rawNumber - raw input from user (spaces or dashes stripped)
 * @returns {object|null} mock identity or null if invalid
 */
const lookupMockAadhaar = (rawNumber) => {
  if (!rawNumber) return null;
  const sanitized = String(rawNumber).replace(/[\s-]/g, '').trim();

  // Basic Aadhaar format check: exactly 12 numeric digits
  if (!/^\d{12}$/.test(sanitized)) {
    return null;
  }

  const match = MOCK_AADHAAR_IDENTITIES.find((id) => id.aadhaar === sanitized);
  if (!match) return null;

  // Return non-sensitive metadata only (NEVER the full number)
  return {
    valid: true,
    maskedDisplay: `XXXXXXXX${sanitized.slice(-4)}`,
    name: match.name,
    state: match.state
  };
};

/**
 * Returns the public list of fake test Aadhaar numbers for tester convenience in UI/docs
 */
const getTestIdentities = () => {
  return MOCK_AADHAAR_IDENTITIES.map((id) => ({
    fakeAadhaar: id.aadhaar,
    name: id.name,
    state: id.state
  }));
};

module.exports = {
  lookupMockAadhaar,
  getTestIdentities
};

