/**
 * LocalStorage Manager
 * Handles all data persistence for the laser tag stats application
 * Data schema version: 1.0
 */

const STORAGE_KEY = 'laserTagStats';
const SCHEMA_VERSION = '1.0';

const DEFAULT_DATA = {
  version: SCHEMA_VERSION,
  sessions: [],
  players: [],
  pendingStats: [],
  guns: []
};

/**
 * Load data from LocalStorage
 * @returns {Object} Parsed data object or default structure
 */
export const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_DATA;

    const data = JSON.parse(stored);

    // Migrate data if version mismatch
    if (data.version !== SCHEMA_VERSION) {
      return migrateData(data);
    }

    return data;
  } catch (error) {
    console.error('Failed to load data from LocalStorage:', error);
    return DEFAULT_DATA;
  }
};

/**
 * Save data to LocalStorage
 * @param {Object} data - Complete data object to save
 * @returns {boolean} Success status
 */
export const saveData = (data) => {
  try {
    const dataToSave = {
      ...data,
      version: SCHEMA_VERSION
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Failed to save data to LocalStorage:', error);

    // Check if quota exceeded
    if (error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded. Consider cleaning old data.');
    }

    return false;
  }
};

/**
 * Export data as JSON file
 * @param {Object} data - Data to export
 * @param {string} filename - Name for downloaded file
 */
export const exportData = (data, filename = 'laser-tag-backup.json') => {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

/**
 * Import data from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Parsed data
 */
export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Clear all data from LocalStorage
 * @returns {boolean} Success status
 */
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear data:', error);
    return false;
  }
};

/**
 * Migrate data from old schema to current version
 * @param {Object} oldData - Data with old schema
 * @returns {Object} Migrated data
 */
const migrateData = (oldData) => {
  console.log(`Migrating data from version ${oldData.version} to ${SCHEMA_VERSION}`);

  // Currently no migrations needed (version 1.0)
  // Future migrations would go here

  return {
    ...DEFAULT_DATA,
    ...oldData,
    version: SCHEMA_VERSION
  };
};

/**
 * Get storage usage information
 * @returns {Object} Storage stats
 */
export const getStorageInfo = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const sizeInBytes = stored ? new Blob([stored]).size : 0;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);

    // Estimate 5MB limit for LocalStorage
    const estimatedLimit = 5 * 1024 * 1024;
    const percentUsed = ((sizeInBytes / estimatedLimit) * 100).toFixed(2);

    return {
      sizeInBytes,
      sizeInKB,
      sizeInMB,
      percentUsed
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return null;
  }
};

/**
 * Clean old sessions and pending stats
 * @param {number} daysOld - Remove data older than this many days
 * @returns {Object} Updated data
 */
export const cleanOldData = (daysOld = 30) => {
  const data = loadData();
  const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

  // Remove old completed sessions
  data.sessions = data.sessions.filter(session => {
    if (session.status === 'active') return true;
    return session.endTime > cutoffDate;
  });

  // Remove old pending stats
  data.pendingStats = data.pendingStats.filter(stat => {
    return stat.timestamp > cutoffDate;
  });

  saveData(data);
  return data;
};
