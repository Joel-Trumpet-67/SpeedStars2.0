import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Pause any currently active program
  await supabase
    .from('programs')
    .update({ status: 'paused' })
    .eq('user_id', user.id)
    .eq('status', 'active')

  const { data, error } = await supabase
    .from('programs')
    .insert({
      user_id: user.id,
      name: body.name,
      type: body.type,
      duration_weeks: body.duration_weeks,
      current_week: 1,
      current_day: 1,
      status: 'active',
      planet_fitness_mode: body.planet_fitness_mode ?? false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
