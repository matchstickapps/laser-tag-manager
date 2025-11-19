/**
 * Supabase Storage Manager
 * Handles all data persistence for the laser tag stats application using Supabase
 * Data schema version: 1.0
 */

import { supabase } from '../lib/supabaseClient';

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
 * Load data from Supabase
 * @returns {Promise<Object>} Parsed data object or default structure
 */
export const loadData = async () => {
  try {
    // Load all data in parallel
    const [sessionsRes, playersRes, pendingRes, gunsRes] = await Promise.all([
      supabase.from('sessions').select('*').order('created_at', { ascending: false }),
      supabase.from('players').select('*').order('created_at', { ascending: false }),
      supabase.from('pending_stats').select('*').order('created_at', { ascending: false }),
      supabase.from('guns').select('*').order('created_at', { ascending: false })
    ]);

    // Check for errors
    if (sessionsRes.error) throw sessionsRes.error;
    if (playersRes.error) throw playersRes.error;
    if (pendingRes.error) throw pendingRes.error;
    if (gunsRes.error) throw gunsRes.error;

    // Transform Supabase data to match localStorage schema
    const data = {
      version: SCHEMA_VERSION,
      sessions: sessionsRes.data.map(transformSessionFromDB),
      players: playersRes.data.map(transformPlayerFromDB),
      pendingStats: pendingRes.data.map(transformPendingFromDB),
      guns: gunsRes.data.map(transformGunFromDB)
    };

    return data;
  } catch (error) {
    console.error('Failed to load data from Supabase:', error);

    // Fallback to localStorage if Supabase fails
    console.warn('Falling back to localStorage');
    return loadDataFromLocalStorage();
  }
};

/**
 * Save data to Supabase
 * @param {Object} data - Complete data object to save
 * @returns {Promise<boolean>} Success status
 */
export const saveData = async (data) => {
  try {
    // Note: This function is kept for backward compatibility
    // In practice, individual entity updates will use specific functions
    // This bulk save is mainly used during initial migration

    // Save each entity type
    const results = await Promise.allSettled([
      saveSessions(data.sessions),
      savePlayers(data.players),
      savePendingStats(data.pendingStats),
      saveGuns(data.guns)
    ]);

    // Check if all saves succeeded
    const allSucceeded = results.every(r => r.status === 'fulfilled');

    if (!allSucceeded) {
      console.error('Some data failed to save:', results.filter(r => r.status === 'rejected'));
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to save data to Supabase:', error);

    // Fallback to localStorage
    return saveDataToLocalStorage(data);
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
 * Clear all data from Supabase
 * @returns {Promise<boolean>} Success status
 */
export const clearAllData = async () => {
  try {
    // Delete all data from all tables
    await Promise.all([
      supabase.from('pending_stats').delete().neq('id', ''), // Delete all
      supabase.from('players').delete().neq('id', ''),
      supabase.from('sessions').delete().neq('id', ''),
      supabase.from('guns').delete().neq('id', '')
    ]);

    // Also clear localStorage
    localStorage.removeItem(STORAGE_KEY);

    return true;
  } catch (error) {
    console.error('Failed to clear data:', error);
    return false;
  }
};

// ==================== Transform Functions ====================

/**
 * Transform session from database format to app format
 */
const transformSessionFromDB = (dbSession) => ({
  id: dbSession.id,
  name: dbSession.name,
  startTime: dbSession.start_time,
  endTime: dbSession.end_time,
  status: dbSession.status,
  playerIds: dbSession.player_ids || []
});

/**
 * Transform session from app format to database format
 */
const transformSessionToDB = (session) => ({
  id: session.id,
  name: session.name,
  start_time: session.startTime,
  end_time: session.endTime,
  status: session.status,
  player_ids: session.playerIds || []
});

/**
 * Transform player from database format to app format
 */
const transformPlayerFromDB = (dbPlayer) => ({
  id: dbPlayer.id,
  gunId: dbPlayer.gun_id,
  name: dbPlayer.name,
  teamId: dbPlayer.team_id,
  currentSessionId: dbPlayer.current_session_id,
  stats: dbPlayer.stats,
  history: dbPlayer.history || [],
  lastUpdated: dbPlayer.last_updated
});

/**
 * Transform player from app format to database format
 */
const transformPlayerToDB = (player) => ({
  id: player.id,
  gun_id: player.gunId,
  name: player.name,
  team_id: player.teamId,
  current_session_id: player.currentSessionId,
  stats: player.stats,
  history: player.history || [],
  last_updated: player.lastUpdated
});

/**
 * Transform pending stats from database format to app format
 */
const transformPendingFromDB = (dbPending) => ({
  id: dbPending.id,
  playerId: dbPending.player_id,
  sessionId: dbPending.session_id,
  capturedImage: dbPending.captured_image,
  extractedStats: dbPending.extracted_stats,
  timestamp: dbPending.timestamp,
  status: dbPending.status
});

/**
 * Transform pending stats from app format to database format
 */
const transformPendingToDB = (pending) => ({
  id: pending.id,
  player_id: pending.playerId,
  session_id: pending.sessionId,
  captured_image: pending.capturedImage,
  extracted_stats: pending.extractedStats,
  timestamp: pending.timestamp,
  status: pending.status
});

/**
 * Transform gun from database format to app format
 */
const transformGunFromDB = (dbGun) => ({
  id: dbGun.id,
  gunNumber: dbGun.gun_number,
  qrCode: dbGun.qr_code,
  status: dbGun.status,
  lastUsed: dbGun.last_used
});

/**
 * Transform gun from app format to database format
 */
const transformGunToDB = (gun) => ({
  id: gun.id,
  gun_number: gun.gunNumber,
  qr_code: gun.qrCode,
  status: gun.status,
  last_used: gun.lastUsed
});

// ==================== Entity-specific Save Functions ====================

/**
 * Save sessions to Supabase
 */
const saveSessions = async (sessions) => {
  if (!sessions || sessions.length === 0) return true;

  const dbSessions = sessions.map(transformSessionToDB);

  const { error } = await supabase
    .from('sessions')
    .upsert(dbSessions, { onConflict: 'id' });

  if (error) throw error;
  return true;
};

/**
 * Save players to Supabase
 */
const savePlayers = async (players) => {
  if (!players || players.length === 0) return true;

  const dbPlayers = players.map(transformPlayerToDB);

  const { error } = await supabase
    .from('players')
    .upsert(dbPlayers, { onConflict: 'id' });

  if (error) throw error;
  return true;
};

/**
 * Save pending stats to Supabase
 */
const savePendingStats = async (pendingStats) => {
  if (!pendingStats || pendingStats.length === 0) return true;

  const dbPending = pendingStats.map(transformPendingToDB);

  const { error } = await supabase
    .from('pending_stats')
    .upsert(dbPending, { onConflict: 'id' });

  if (error) throw error;
  return true;
};

/**
 * Save guns to Supabase
 */
const saveGuns = async (guns) => {
  if (!guns || guns.length === 0) return true;

  const dbGuns = guns.map(transformGunToDB);

  const { error } = await supabase
    .from('guns')
    .upsert(dbGuns, { onConflict: 'id' });

  if (error) throw error;
  return true;
};

// ==================== LocalStorage Fallback Functions ====================

/**
 * Load data from LocalStorage (fallback)
 */
const loadDataFromLocalStorage = () => {
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
 * Save data to LocalStorage (fallback)
 */
const saveDataToLocalStorage = (data) => {
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
 * @returns {Promise<Object>} Updated data
 */
export const cleanOldData = async (daysOld = 30) => {
  try {
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    // Delete old completed sessions from Supabase
    const { error: sessionsError } = await supabase
      .from('sessions')
      .delete()
      .neq('status', 'active')
      .lt('end_time', cutoffDate);

    if (sessionsError) throw sessionsError;

    // Delete old pending stats
    const { error: pendingError } = await supabase
      .from('pending_stats')
      .delete()
      .lt('timestamp', cutoffDate);

    if (pendingError) throw pendingError;

    // Return updated data
    return await loadData();
  } catch (error) {
    console.error('Failed to clean old data from Supabase:', error);

    // Fallback to localStorage
    const data = loadDataFromLocalStorage();
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    data.sessions = data.sessions.filter(session => {
      if (session.status === 'active') return true;
      return session.endTime > cutoffDate;
    });

    data.pendingStats = data.pendingStats.filter(stat => {
      return stat.timestamp > cutoffDate;
    });

    saveDataToLocalStorage(data);
    return data;
  }
};
