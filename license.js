/**
 * license.js — Offline machine-specific license verification for SabaHacked
 * Uses HMAC-SHA256 to verify license keys locally without any network calls.
 */

const LicenseManager = (() => {
  const LICENSE_KEY_STORAGE = 'licenseKey';
  // Shared secret — must match keygen.html
  const SECRET_KEY = 'SaBaHacked@2025!SecretKey#HNA';

  /**
   * Generate a machine fingerprint by hashing navigator properties.
   * @returns {Promise<string>} hex fingerprint (64 chars)
   */
  async function generateFingerprint() {
    const raw = [
      navigator.userAgent || '',
      navigator.language || '',
      `${screen.width}x${screen.height}`,
      `${screen.colorDepth}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      navigator.hardwareConcurrency || '',
      navigator.platform || ''
    ].join('|');

    const data = new TextEncoder().encode(raw);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get short machine code (first 8 chars of fingerprint, uppercase).
   * This is what the user sends to admin.
   * @returns {Promise<string>} 8-char uppercase hex
   */
  async function getMachineCode() {
    const fp = await generateFingerprint();
    return fp.substring(0, 8).toUpperCase();
  }

  /**
   * Generate a license key for a given machine code using HMAC-SHA256.
   * @param {string} machineCode - 8-char hex machine code
   * @returns {Promise<string>} 16-char uppercase hex license key
   */
  async function generateLicenseKey(machineCode) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET_KEY);
    const msgData = encoder.encode(machineCode.toUpperCase());

    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );

    const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const sigArray = Array.from(new Uint8Array(sigBuffer));
    const fullHex = sigArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return fullHex.substring(0, 16).toUpperCase();
  }

  /**
   * Verify a license key offline by comparing with expected HMAC output.
   * @param {string} key - User-provided license key
   * @returns {Promise<boolean>} true if valid
   */
  async function verifyOffline(key) {
    if (!key || key.trim().length === 0) return false;
    const machineCode = await getMachineCode();
    const expected = await generateLicenseKey(machineCode);
    return key.trim().toUpperCase() === expected;
  }

  /**
   * Get the saved license key from sync storage.
   * @returns {Promise<string>}
   */
  async function getSavedKey() {
    const data = await chrome.storage.sync.get({ [LICENSE_KEY_STORAGE]: '' });
    return data[LICENSE_KEY_STORAGE] || '';
  }

  /**
   * Save license key to sync storage.
   * @param {string} key
   */
  async function saveKey(key) {
    await chrome.storage.sync.set({ [LICENSE_KEY_STORAGE]: key });
  }

  /**
   * Full license check — offline, no network, no cache needed.
   * @returns {Promise<{valid: boolean, source: string}>}
   */
  async function checkLicense() {
    const key = await getSavedKey();
    if (!key) return { valid: false, source: 'no_key' };

    try {
      const valid = await verifyOffline(key);
      return { valid, source: valid ? 'offline' : 'invalid_key' };
    } catch (e) {
      return { valid: false, source: 'error' };
    }
  }

  return {
    generateFingerprint,
    getMachineCode,
    generateLicenseKey,
    verifyOffline,
    getSavedKey,
    saveKey,
    checkLicense
  };
})();
