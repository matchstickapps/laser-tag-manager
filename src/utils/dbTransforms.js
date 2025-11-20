/**
 * Database Transform Utilities
 * Converts between app format (camelCase) and database format (snake_case)
 */

// ==================== Session Transforms ====================

export const transformSessionFromDB = (dbSession) => ({
  id: dbSession.id,
  name: dbSession.name,
  startTime: dbSession.start_time,
  endTime: dbSession.end_time,
  status: dbSession.status,
  playerIds: dbSession.player_ids || []
})

export const transformSessionToDB = (session) => ({
  id: session.id,
  name: session.name,
  start_time: session.startTime,
  end_time: session.endTime,
  status: session.status,
  player_ids: session.playerIds || []
})

// ==================== Player Transforms ====================

export const transformPlayerFromDB = (dbPlayer) => ({
  id: dbPlayer.id,
  gunId: dbPlayer.gun_id,
  name: dbPlayer.name,
  teamId: dbPlayer.team_id,
  currentSessionId: dbPlayer.current_session_id,
  stats: dbPlayer.stats,
  history: dbPlayer.history || [],
  lastUpdated: dbPlayer.last_updated
})

export const transformPlayerToDB = (player) => ({
  id: player.id,
  gun_id: player.gunId,
  name: player.name,
  team_id: player.teamId,
  current_session_id: player.currentSessionId,
  stats: player.stats,
  history: player.history || [],
  last_updated: player.lastUpdated
})

// ==================== Pending Stats Transforms ====================

export const transformPendingFromDB = (dbPending) => ({
  id: dbPending.id,
  playerId: dbPending.player_id,
  sessionId: dbPending.session_id,
  capturedImage: dbPending.captured_image,
  extractedStats: dbPending.extracted_stats,
  timestamp: dbPending.timestamp,
  status: dbPending.status
})

export const transformPendingToDB = (pending) => ({
  id: pending.id,
  player_id: pending.playerId,
  session_id: pending.sessionId,
  captured_image: pending.capturedImage,
  extracted_stats: pending.extractedStats,
  timestamp: pending.timestamp,
  status: pending.status
})

// ==================== Gun Transforms ====================

export const transformGunFromDB = (dbGun) => ({
  id: dbGun.id,
  gunNumber: dbGun.gun_number,
  qrCode: dbGun.qr_code,
  status: dbGun.status,
  lastUsed: dbGun.last_used
})

export const transformGunToDB = (gun) => ({
  id: gun.id,
  gun_number: gun.gunNumber,
  qr_code: gun.qrCode,
  status: gun.status,
  last_used: gun.lastUsed
})
