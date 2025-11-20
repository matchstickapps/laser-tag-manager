import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../../lib/supabaseServer'

/**
 * POST /api/data/clean
 * Clean old sessions and pending stats
 */
export async function POST(request) {
  try {
    const { daysOld = 30 } = await request.json()
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000)

    // Delete old completed sessions
    const { error: sessionsError } = await supabaseServer
      .from('sessions')
      .delete()
      .neq('status', 'active')
      .lt('end_time', cutoffDate)

    if (sessionsError) throw sessionsError

    // Delete old pending stats
    const { error: pendingError } = await supabaseServer
      .from('pending_stats')
      .delete()
      .lt('timestamp', cutoffDate)

    if (pendingError) throw pendingError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to clean old data:', error)
    return NextResponse.json(
      { error: 'Failed to clean old data', details: error.message },
      { status: 500 }
    )
  }
}
