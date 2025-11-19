/**
 * Stats Calculator
 * Calculate derived statistics: K/D ratio, score, etc.
 */

/**
 * Calculate K/D (Kill/Death) ratio
 * @param {number} kills - Number of tags/kills
 * @param {number} deaths - Number of deactivations/deaths
 * @returns {number} K/D ratio (rounded to 2 decimals)
 */
export const calculateKDRatio = (kills, deaths) => {
  if (deaths === 0) {
    return kills; // Perfect ratio if no deaths
  }
  return parseFloat((kills / deaths).toFixed(2));
};

/**
 * Calculate player score
 * Formula: (tags * 10) - (deactivations * 5) + accuracy
 * @param {number} tags - Number of kills
 * @param {number} deactivations - Number of deaths
 * @param {number} accuracy - Accuracy percentage (0-100)
 * @returns {number} Total score
 */
export const calculateScore = (tags, deactivations, accuracy) => {
  const tagPoints = tags * 10;
  const deathPenalty = deactivations * 5;
  const accuracyBonus = accuracy;

  return Math.max(0, tagPoints - deathPenalty + accuracyBonus);
};

/**
 * Calculate team totals
 * @param {Array} players - Array of player objects
 * @returns {Object} Team statistics
 */
export const calculateTeamStats = (players) => {
  const teamStats = {
    '1A': { // Red Team
      totalTags: 0,
      totalDeactivations: 0,
      totalScore: 0,
      playerCount: 0,
      avgAccuracy: 0,
      avgKD: 0
    },
    '1B': { // Blue Team
      totalTags: 0,
      totalDeactivations: 0,
      totalScore: 0,
      playerCount: 0,
      avgAccuracy: 0,
      avgKD: 0
    }
  };

  players.forEach(player => {
    const team = player.teamId;
    if (!teamStats[team]) return;

    teamStats[team].totalTags += player.stats.tags;
    teamStats[team].totalDeactivations += player.stats.deactivations;
    teamStats[team].totalScore += player.stats.score;
    teamStats[team].playerCount += 1;
  });

  // Calculate averages
  ['1A', '1B'].forEach(team => {
    const count = teamStats[team].playerCount;
    if (count > 0) {
      const teamPlayers = players.filter(p => p.teamId === team);
      const totalAccuracy = teamPlayers.reduce((sum, p) => sum + p.stats.accuracy, 0);
      const totalKD = teamPlayers.reduce((sum, p) => sum + p.stats.kdRatio, 0);

      teamStats[team].avgAccuracy = parseFloat((totalAccuracy / count).toFixed(2));
      teamStats[team].avgKD = parseFloat((totalKD / count).toFixed(2));
    }
  });

  return teamStats;
};

/**
 * Sort players by specified criterion
 * @param {Array} players - Array of player objects
 * @param {string} sortBy - 'tags', 'kd', 'accuracy', 'score'
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted players
 */
export const sortPlayers = (players, sortBy = 'score', order = 'desc') => {
  const sorted = [...players].sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case 'tags':
        aVal = a.stats.tags;
        bVal = b.stats.tags;
        break;
      case 'kd':
        aVal = a.stats.kdRatio;
        bVal = b.stats.kdRatio;
        break;
      case 'accuracy':
        aVal = a.stats.accuracy;
        bVal = b.stats.accuracy;
        break;
      case 'score':
      default:
        aVal = a.stats.score;
        bVal = b.stats.score;
        break;
    }

    if (order === 'desc') {
      return bVal - aVal;
    } else {
      return aVal - bVal;
    }
  });

  return sorted;
};

/**
 * Get top performers
 * @param {Array} players - Array of player objects
 * @returns {Object} Top performers by category
 */
export const getTopPerformers = (players) => {
  if (players.length === 0) {
    return {
      mostKills: null,
      bestAccuracy: null,
      bestKD: null,
      highestScore: null
    };
  }

  return {
    mostKills: sortPlayers(players, 'tags', 'desc')[0],
    bestAccuracy: sortPlayers(players, 'accuracy', 'desc')[0],
    bestKD: sortPlayers(players, 'kd', 'desc')[0],
    highestScore: sortPlayers(players, 'score', 'desc')[0]
  };
};

/**
 * Calculate session statistics
 * @param {Array} players - Array of player objects
 * @returns {Object} Session-wide statistics
 */
export const calculateSessionStats = (players) => {
  if (players.length === 0) {
    return {
      totalPlayers: 0,
      totalTags: 0,
      totalDeactivations: 0,
      avgAccuracy: 0,
      avgKD: 0,
      highestScore: 0
    };
  }

  const totalTags = players.reduce((sum, p) => sum + p.stats.tags, 0);
  const totalDeactivations = players.reduce((sum, p) => sum + p.stats.deactivations, 0);
  const totalAccuracy = players.reduce((sum, p) => sum + p.stats.accuracy, 0);
  const totalKD = players.reduce((sum, p) => sum + p.stats.kdRatio, 0);

  const scores = players.map(p => p.stats.score);
  const highestScore = Math.max(...scores);

  return {
    totalPlayers: players.length,
    totalTags,
    totalDeactivations,
    avgAccuracy: parseFloat((totalAccuracy / players.length).toFixed(2)),
    avgKD: parseFloat((totalKD / players.length).toFixed(2)),
    highestScore
  };
};

/**
 * Normalize stats object from parsed OCR data
 * Converts the parsed stats format to player stats format
 * @param {Object} parsedStats - Stats from parseStats()
 * @returns {Object} Normalized stats for player object
 */
export const normalizeStats = (parsedStats) => {
  const tags = parsedStats.tags.value;
  const deactivations = parsedStats.deactivations.value;
  const accuracy = parsedStats.accuracy.value;

  const kdRatio = calculateKDRatio(tags, deactivations);
  const score = calculateScore(tags, deactivations, accuracy);

  return {
    hp: parsedStats.hp,
    ammo: parsedStats.ammo.value,
    reloads: parsedStats.reloads.value,
    tags,
    deactivations,
    accuracy,
    respawns: parsedStats.respawns.value,
    kdRatio,
    score
  };
};
