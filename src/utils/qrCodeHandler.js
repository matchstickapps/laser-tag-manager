/**
 * QR Code Handler
 * Helper functions for QR code operations
 */

/**
 * Parse gun ID from QR code data
 * @param {string} qrData - Raw QR code string
 * @returns {Object} { gunId: string, gunNumber: number }
 */
export const parseQRCode = (qrData) => {
  // Assume QR code format: "GUN-001" or similar
  // Extract the gun ID and number

  const match = qrData.match(/GUN[- ]?(\d+)/i);

  if (match) {
    return {
      gunId: qrData,
      gunNumber: parseInt(match[1], 10)
    };
  }

  // Fallback: use entire string as gunId
  return {
    gunId: qrData,
    gunNumber: parseInt(qrData.replace(/\D/g, ''), 10) || 0
  };
};

/**
 * Validate QR code format
 * @param {string} qrData - Raw QR code string
 * @returns {boolean} True if valid
 */
export const isValidQRCode = (qrData) => {
  if (!qrData || typeof qrData !== 'string') {
    return false;
  }

  // Check minimum length
  if (qrData.length < 3) {
    return false;
  }

  // For now, accept any non-empty string
  // Can be customized based on actual QR code format
  return true;
};

/**
 * Generate QR code content for a gun
 * @param {number} gunNumber - Gun number
 * @returns {string} QR code content
 */
export const generateQRContent = (gunNumber) => {
  return `GUN-${gunNumber.toString().padStart(3, '0')}`;
};

/**
 * Find or create gun record
 * @param {string} qrCode - QR code data
 * @param {Array} guns - Existing guns array
 * @returns {Object} Gun object
 */
export const findOrCreateGun = (qrCode, guns) => {
  let gun = guns.find(g => g.qrCode === qrCode);

  if (!gun) {
    const parsed = parseQRCode(qrCode);
    gun = {
      qrCode,
      gunNumber: parsed.gunNumber,
      lastUsedBy: null
    };
  }

  return gun;
};
