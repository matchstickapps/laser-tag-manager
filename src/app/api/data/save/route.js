import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../../lib/supabaseServer'
import {
  transformSessionToDB,
  transformPlayerToDB,
  transformPendingToDB,
  transformGunToDB
} from '../../../../utils/dbTransforms'

/**
 * POST /api/data/save
 * Save all data to Supabase
 */
export async function POST(request) {
  try {
    const data = await request.json()

    // Transform and save each entity type
    const results = await Promise.allSettled([
      saveSessions(data.sessions || []),
      savePlayers(data.players || []),
      savePendingStats(data.pendingStats || []),
      saveGuns(data.guns || [])
    ])

    // Check if all saves succeeded
    const failures = results.filter(r => r.status === 'rejected')
    if (failures.length > 0) {
      console.error('Some data failed to save:', failures)
      return NextResponse.json(
        { error: 'Some data failed to save', failures },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save data to Supabase:', error)
    return NextResponse.json(
      { error: 'Failed to save data', details: error.message },
      { status: 500 }
    )
  }
}

// Helper functions
async function saveSessions(sessions) {
  if (!sessions || sessions.length === 0) return true

  const dbSessions = sessions.map(transformSessionToDB)
  const { error } = await supabaseServer
    .from('sessions')
    .upsert(dbSessions, { onConflict: 'id' })

  if (error) throw error
  return true
}

async function savePlayers(players) {
  if (!players || players.length === 0) return true

  const dbPlayers = players.map(transformPlayerToDB)
  const { error } = await supabaseServer
    .from('players')
    .upsert(dbPlayers, { onConflict: 'id' })

  if (error) throw error
  return true
}

async function savePendingStats(pendingStats) {
  if (!pendingStats || pendingStats.length === 0) return true

  const dbPending = pendingStats.map(transformPendingToDB)
  const { error } = await supabaseServer
    .from('pending_stats')
    .upsert(dbPending, { onConflict: 'id' })

  if (error) throw error
  return true
}

async function saveGuns(guns) {
  if (!guns || guns.length === 0) return true

  const dbGuns = guns.map(transformGunToDB)
  const { error } = await supabaseServer
    .from('guns')
    .upsert(dbGuns, { onConflict: 'id' })

  if (error) throw error
  return true
}
