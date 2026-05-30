import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: all }, { data: earned }] = await Promise.all([
    supabase.from('achievements').select('*').order('condition_value'),
    supabase.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', user.id),
  ])

  return NextResponse.json({ data: { all, earned } })
}
