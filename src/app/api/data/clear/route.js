import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../../lib/supabaseServer'

/**
 * DELETE /api/data/clear
 * Clear all data from Supabase
 */
export async function DELETE() {
  try {
    // Delete all data from all tables
    await Promise.all([
      supabaseServer.from('pending_stats').delete().neq('id', ''),
      supabaseServer.from('players').delete().neq('id', ''),
      supabaseServer.from('sessions').delete().neq('id', ''),
      supabaseServer.from('guns').delete().neq('id', '')
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to clear data:', error)
    return NextResponse.json(
      { error: 'Failed to clear data', details: error.message },
      { status: 500 }
    )
  }
}
