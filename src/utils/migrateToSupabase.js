/**
 * Migration Utility
 * Migrate existing localStorage data to Supabase
 */

import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'laserTagStats';

/**
 * Migrate localStorage data to Supabase
 * @returns {Promise<Object>} Migration result with status and details
 */
export const migrateLocalStorageToSupabase = async () => {
  const result = {
    success: false,
    message: '',
    details: {
      sessions: { migrated: 0, failed: 0 },
      players: { migrated: 0, failed: 0 },
      pendingStats: { migrated: 0, failed: 0 },
      guns: { migrated: 0, failed: 0 }
    }
  };

  try {
    // Step 1: Load data from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      result.message = 'No data found in localStorage';
      return result;
    }

    const localData = JSON.parse(stored);
    console.log('Found localStorage data:', localData);

    // Step 2: Migrate sessions
    if (localData.sessions && localData.sessions.length > 0) {
      const sessionsToMigrate = localData.sessions.map(session => ({
        id: session.id,
        name: session.name,
        start_time: session.startTime,
        end_time: session.endTime,
        status: session.status,
        player_ids: session.playerIds || []
      }));

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .upsert(sessionsToMigrate, { onConflict: 'id' });

      if (sessionsError) {
        console.error('Sessions migration error:', sessionsError);
        result.details.sessions.failed = localData.sessions.length;
      } else {
        result.details.sessions.migrated = localData.sessions.length;
      }
    }

    // Step 3: Migrate players
    if (localData.players && localData.players.length > 0) {
      const playersToMigrate = localData.players.map(player => ({
        id: player.id,
        gun_id: player.gunId,
        name: player.name,
        team_id: player.teamId,
        current_session_id: player.currentSessionId,
        stats: player.stats,
        history: player.history || [],
        last_updated: player.lastUpdated
      }));

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .upsert(playersToMigrate, { onConflict: 'id' });

      if (playersError) {
        console.error('Players migration error:', playersError);
        result.details.players.failed = localData.players.length;
      } else {
        result.details.players.migrated = localData.players.length;
      }
    }

    // Step 4: Migrate pending stats
    if (localData.pendingStats && localData.pendingStats.length > 0) {
      const pendingToMigrate = localData.pendingStats.map(pending => ({
        id: pending.id,
        player_id: pending.playerId,
        session_id: pending.sessionId,
        captured_image: pending.capturedImage,
        extracted_stats: pending.extractedStats,
        timestamp: pending.timestamp,
        status: pending.status
      }));

      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_stats')
        .upsert(pendingToMigrate, { onConflict: 'id' });

      if (pendingError) {
        console.error('Pending stats migration error:', pendingError);
        result.details.pendingStats.failed = localData.pendingStats.length;
      } else {
        result.details.pendingStats.migrated = localData.pendingStats.length;
      }
    }

    // Step 5: Migrate guns
    if (localData.guns && localData.guns.length > 0) {
      const gunsToMigrate = localData.guns.map(gun => ({
        id: gun.id,
        gun_number: gun.gunNumber,
        qr_code: gun.qrCode,
        status: gun.status,
        last_used: gun.lastUsed
      }));

      const { data: gunsData, error: gunsError } = await supabase
        .from('guns')
        .upsert(gunsToMigrate, { onConflict: 'id' });

      if (gunsError) {
        console.error('Guns migration error:', gunsError);
        result.details.guns.failed = localData.guns.length;
      } else {
        result.details.guns.migrated = localData.guns.length;
      }
    }

    // Calculate success
    const totalMigrated =
      result.details.sessions.migrated +
      result.details.players.migrated +
      result.details.pendingStats.migrated +
      result.details.guns.migrated;

    const totalFailed =
      result.details.sessions.failed +
      result.details.players.failed +
      result.details.pendingStats.failed +
      result.details.guns.failed;

    if (totalFailed === 0 && totalMigrated > 0) {
      result.success = true;
      result.message = `Successfully migrated ${totalMigrated} records to Supabase`;
    } else if (totalMigrated > 0 && totalFailed > 0) {
      result.success = true;
      result.message = `Partially migrated: ${totalMigrated} succeeded, ${totalFailed} failed`;
    } else if (totalMigrated === 0 && totalFailed === 0) {
      result.success = true;
      result.message = 'No data to migrate';
    } else {
      result.message = `Migration failed: ${totalFailed} records could not be migrated`;
    }

    return result;
  } catch (error) {
    console.error('Migration error:', error);
    result.message = `Migration error: ${error.message}`;
    return result;
  }
};

/**
 * Create a backup of localStorage data before migration
 * @returns {boolean} Success status
 */
export const backupLocalStorageData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('No data to backup');
      return false;
    }

    const data = JSON.parse(stored);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `laser-tag-backup-${timestamp}.json`;

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);

    console.log(`Backup created: ${filename}`);
    return true;
  } catch (error) {
    console.error('Backup error:', error);
    return false;
  }
};

/**
 * Check if migration is needed
 * @returns {Promise<boolean>} True if localStorage has data and Supabase is empty
 */
export const needsMigration = async () => {
  try {
    // Check if localStorage has data
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const localData = JSON.parse(stored);
    const hasLocalData =
      (localData.sessions && localData.sessions.length > 0) ||
      (localData.players && localData.players.length > 0) ||
      (localData.pendingStats && localData.pendingStats.length > 0) ||
      (localData.guns && localData.guns.length > 0);

    if (!hasLocalData) return false;

    // Check if Supabase is empty
    const { count } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    return count === 0;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};
