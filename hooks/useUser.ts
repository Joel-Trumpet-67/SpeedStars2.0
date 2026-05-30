'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

export function useUser() {
  const profile = useAppStore(s => s.profile)
  const trainingMaxes = useAppStore(s => s.trainingMaxes)
  const signOutStore = useAppStore(s => s.signOut)
  const router = useRouter()

  const signOut = () => {
    signOutStore()
    router.push('/')
  }

  return {
    user: profile ? { id: profile.id, email: profile.email } : null,
    profile,
    trainingMaxes,
    loading: false,
    signOut,
    refreshProfile: () => {},
  }
}
