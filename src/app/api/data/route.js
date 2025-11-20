import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../lib/supabaseServer'
import {
  transformSessionFromDB,
  transformPlayerFromDB,
  transformPendingFromDB,
  transformGunFromDB
} from '../../../utils/dbTransforms'

const SCHEMA_VERSION = '1.0'

/**
 * GET /api/data
 * Load all data from Supabase
 */
export async function GET() {
  try {
    // Load all data in parallel
    const [sessionsRes, playersRes, pendingRes, gunsRes] = await Promise.all([
      supabaseServer.from('sessions').select('*').order('created_at', { ascending: false }),
      supabaseServer.from('players').select('*').order('created_at', { ascending: false }),
      supabaseServer.from('pending_stats').select('*').order('created_at', { ascending: false }),
      supabaseServer.from('guns').select('*').order('created_at', { ascending: false })
    ])

    // Check for errors
    if (sessionsRes.error) throw sessionsRes.error
    if (playersRes.error) throw playersRes.error
    if (pendingRes.error) throw pendingRes.error
    if (gunsRes.error) throw gunsRes.error

    // Transform Supabase data to match app schema
    const data = {
      version: SCHEMA_VERSION,
      sessions: sessionsRes.data.map(transformSessionFromDB),
      players: playersRes.data.map(transformPlayerFromDB),
      pendingStats: pendingRes.data.map(transformPendingFromDB),
      guns: gunsRes.data.map(transformGunFromDB)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to load data from Supabase:', error)
    return NextResponse.json(
      { error: 'Failed to load data', details: error.message },
      { status: 500 }
    )
  }
}
