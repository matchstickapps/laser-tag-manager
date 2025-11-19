/**
 * Stats Parser
 * Extracts laser tag gun statistics from OCR text output
 * Handles variable digit lengths and spaces in numbers
 */

/**
 * Clean OCR text by normalizing whitespace
 * @param {string} text - Raw OCR output
 * @returns {string} Cleaned text
 */
const cleanOCRText = (text) => {
  if (!text) return '';

  // Replace multiple spaces/tabs with single space
  // Preserve newlines for line-based parsing
  return text
    .replace(/[ \t]+/g, ' ')
    .trim();
};

/**
 * Extract HP (Lives) from OCR text
 * Format: "HP 5 / 5" or "HP: 10 / 10" or "HP10/10"
 * Range: 0-99 for each value
 * @param {string} text - OCR text
 * @returns {Object} { current, max, confidence }
 */
const extractHP = (text) => {
  // Pattern handles: "HP", "HP:", optional spaces, 1-2 digits, "/", 1-2 digits
  const patterns = [
    /HP[:\s]*(\d{1,2})\s*[\/]\s*(\d{1,2})/i,
    /HP[:\s]*(\d{1,2})\s*\/\s*(\d{1,2})/i,
    /HP(\d{1,2})\/(\d{1,2})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const current = parseInt(match[1], 10);
      const max = parseInt(match[2], 10);

      // Validate range
      if (current >= 0 && current <= 99 && max >= 0 && max <= 99) {
        return {
          current,
          max,
          confidence: 0.9
        };
      }
    }
  }

  return { current: 0, max: 0, confidence: 0 };
};

/**
 * Extract Ammo from OCR text
 * Format: "AMMO: 50 / 50", "AMMO 100 / 100", "AMMO: EM", "AMMO: UNLIMITED"
 * Range: 0-999 for each value, or special strings
 * @param {string} text - OCR text
 * @returns {Object} { value, confidence }
 */
const extractAmmo = (text) => {
  // Check for special values first
  if (/AMMO[:\s]*(EM|UNLIMITED)/i.test(text)) {
    const match = text.match(/AMMO[:\s]*(EM|UNLIMITED)/i);
    return {
      value: match[1].toUpperCase(),
      confidence: 0.85
    };
  }

  // Pattern for numeric ammo: 1-3 digits / 1-3 digits
  const patterns = [
    /AMMO[:\s]*(\d{1,3})\s*[\/]\s*(\d{1,3})/i,
    /AMMO[:\s]*(\d{1,3})\s*\/\s*(\d{1,3})/i,
    /AMMO(\d{1,3})\/(\d{1,3})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const current = parseInt(match[1], 10);
      const max = parseInt(match[2], 10);

      // Validate range
      if (current >= 0 && current <= 999 && max >= 0 && max <= 999) {
        return {
          value: { current, max },
          confidence: 0.9
        };
      }
    }
  }

  return { value: { current: 0, max: 0 }, confidence: 0 };
};

/**
 * Extract Reloads from OCR text
 * Format: "R UNLIMITED" or "R: 5" or "R 10"
 * @param {string} text - OCR text
 * @returns {Object} { value, confidence }
 */
const extractReloads = (text) => {
  // Check for UNLIMITED
  if (/R[:\s]*UNLIMITED/i.test(text)) {
    return {
      value: 'UNLIMITED',
      confidence: 0.9
    };
  }

  // Check for numeric value
  const patterns = [
    /R[:\s]*(\d{1,3})/i,
    /R(\d{1,3})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      if (value >= 0 && value <= 999) {
        return {
          value,
          confidence: 0.85
        };
      }
    }
  }

  return { value: 'UNLIMITED', confidence: 0 };
};

/**
 * Extract Tags/Kills from OCR text
 * Format: "T: 12" or "T:0" or "T 99"
 * Range: 0-999
 * @param {string} text - OCR text
 * @returns {Object} { value, confidence }
 */
const extractTags = (text) => {
  const patterns = [
    /T[:\s]+(\d{1,3})/i,
    /T:(\d{1,3})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      if (value >= 0 && value <= 999) {
        return {
          value,
          confidence: 0.9
        };
      }
    }
  }

  return { value: 0, confidence: 0 };
};

/**
 * Extract Deactivations/Deaths from OCR text
 * Format: "D: 3" or "D:0" or "D 15"
 * Range: 0-999
 * @param {string} text - OCR text
 * @returns {Object} { value, confidence }
 */
const extractDeactivations = (text) => {
  const patterns = [
    /D[:\s]+(\d{1,3})/i,
    /D:(\d{1,3})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      if (value >= 0 && value <= 999) {
        return {
          value,
          confidence: 0.9
        };
      }
    }
  }

  return { value: 0, confidence: 0 };
};

/**
 * Extract Accuracy from OCR text
 * Format: "A: 19%" or "A:0%" or "A 100%"
 * Range: 0-100
 * @param {string} text - OCR text
 * @returns {Object} { value, confidence }
 */
const extractAccuracy = (text) => {
  const patterns = [
    /A[:\s]+(\d{1,3})%/i,
    /A:(\d{1,3})%/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      if (value >= 0 && value <= 100) {
        return {
          value,
          confidence: 0.85
        };
      }
    }
  }

  return { value: 0, confidence: 0 };
};

/**
 * Extract Team from OCR text
 * Format: "1A" (Red Team) or "1B" (Blue Team)
 * @param {string} text - OCR text
 * @returns {Object} { value, confidence }
 */
const extractTeam = (text) => {
  const match = text.match(/(1A|1B)/i);
  if (match) {
    return {
      value: match[1].toUpperCase(),
      confidence: 0.9
    };
  }

  return { value: '1A', confidence: 0 };
};

/**
 * Extract Respawns from OCR text
 * Format: "1B18" where "18" is respawn count, or "S: 18"
 * Range: 0-999
 * @param {string} text - OCR text
 * @returns {Object} { value, confidence }
 */
const extractRespawns = (text) => {
  // Try to extract from "S:" prefix first
  const sPattern = /S[:\s]+(\d{1,3})/i;
  const sMatch = text.match(sPattern);
  if (sMatch) {
    const value = parseInt(sMatch[1], 10);
    if (value >= 0 && value <= 999) {
      return {
        value,
        confidence: 0.85
      };
    }
  }

  // Try to extract from team+respawns format: "1A18" or "1B18"
  const teamPattern = /1[AB](\d{1,3})/i;
  const teamMatch = text.match(teamPattern);
  if (teamMatch) {
    const value = parseInt(teamMatch[1], 10);
    if (value >= 0 && value <= 999) {
      return {
        value,
        confidence: 0.7
      };
    }
  }

  return { value: 0, confidence: 0 };
};

/**
 * Parse complete stats from OCR text
 * @param {string} ocrText - Raw OCR output
 * @returns {Object} Extracted stats with confidence scores
 */
export const parseStats = (ocrText) => {
  const cleanedText = cleanOCRText(ocrText);

  const hp = extractHP(cleanedText);
  const ammo = extractAmmo(cleanedText);
  const reloads = extractReloads(cleanedText);
  const tags = extractTags(cleanedText);
  const deactivations = extractDeactivations(cleanedText);
  const accuracy = extractAccuracy(cleanedText);
  const team = extractTeam(cleanedText);
  const respawns = extractRespawns(cleanedText);

  return {
    hp: {
      current: hp.current,
      max: hp.max,
      confidence: hp.confidence
    },
    ammo: {
      value: ammo.value,
      confidence: ammo.confidence
    },
    reloads: {
      value: reloads.value,
      confidence: reloads.confidence
    },
    tags: {
      value: tags.value,
      confidence: tags.confidence
    },
    deactivations: {
      value: deactivations.value,
      confidence: deactivations.confidence
    },
    accuracy: {
      value: accuracy.value,
      confidence: accuracy.confidence
    },
    team: {
      value: team.value,
      confidence: team.confidence
    },
    respawns: {
      value: respawns.value,
      confidence: respawns.confidence
    }
  };
};

/**
 * Calculate overall confidence for parsed stats
 * @param {Object} parsedStats - Stats object from parseStats
 * @returns {number} Average confidence (0-1)
 */
export const calculateOverallConfidence = (parsedStats) => {
  const confidences = [
    parsedStats.hp.confidence,
    parsedStats.ammo.confidence,
    parsedStats.reloads.confidence,
    parsedStats.tags.confidence,
    parsedStats.deactivations.confidence,
    parsedStats.accuracy.confidence,
    parsedStats.team.confidence,
    parsedStats.respawns.confidence
  ];

  const sum = confidences.reduce((acc, val) => acc + val, 0);
  return sum / confidences.length;
};

/**
 * Validate parsed stats
 * @param {Object} stats - Parsed stats object
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateStats = (stats) => {
  const errors = [];

  // Validate HP
  if (stats.hp.current < 0 || stats.hp.current > 99) {
    errors.push('HP current value out of range (0-99)');
  }
  if (stats.hp.max < 0 || stats.hp.max > 99) {
    errors.push('HP max value out of range (0-99)');
  }

  // Validate Ammo if numeric
  if (typeof stats.ammo.value === 'object') {
    if (stats.ammo.value.current < 0 || stats.ammo.value.current > 999) {
      errors.push('Ammo current value out of range (0-999)');
    }
    if (stats.ammo.value.max < 0 || stats.ammo.value.max > 999) {
      errors.push('Ammo max value out of range (0-999)');
    }
  }

  // Validate Tags
  if (stats.tags.value < 0 || stats.tags.value > 999) {
    errors.push('Tags value out of range (0-999)');
  }

  // Validate Deactivations
  if (stats.deactivations.value < 0 || stats.deactivations.value > 999) {
    errors.push('Deactivations value out of range (0-999)');
  }

  // Validate Accuracy
  if (stats.accuracy.value < 0 || stats.accuracy.value > 100) {
    errors.push('Accuracy value out of range (0-100)');
  }

  // Validate Team
  if (!['1A', '1B'].includes(stats.team.value)) {
    errors.push('Invalid team value (must be 1A or 1B)');
  }

  // Validate Respawns
  if (stats.respawns.value < 0 || stats.respawns.value > 999) {
    errors.push('Respawns value out of range (0-999)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
