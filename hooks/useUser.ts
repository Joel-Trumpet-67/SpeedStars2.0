'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, TrainingMaxes } from '@/types'

export function useUser() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [trainingMaxes, setTrainingMaxes] = useState<TrainingMaxes | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient()
    const [{ data: profileData }, { data: tmData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('training_maxes').select('*').eq('user_id', userId).single(),
    ])
    if (profileData) setProfile(profileData as UserProfile)
    if (tmData) setTrainingMaxes(tmData as TrainingMaxes)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setTrainingMaxes(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const refreshProfile = () => {
    if (user) fetchProfile(user.id)
  }

  return { user, profile, trainingMaxes, loading, signOut, refreshProfile }
}
