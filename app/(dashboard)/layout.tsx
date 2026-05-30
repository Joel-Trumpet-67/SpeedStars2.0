'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Spinner } from '@/components/ui/Spinner'

export default function Layout({ children }: { children: React.ReactNode }) {
  const profile = useAppStore(s => s.profile)
  const router = useRouter()

  useEffect(() => {
    if (!profile) router.replace('/signup')
  }, [profile, router])

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
