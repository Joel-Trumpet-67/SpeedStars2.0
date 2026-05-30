'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Zap } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const profile = useAppStore(s => s.profile)

  useEffect(() => {
    if (profile) router.replace('/dashboard')
  }, [profile, router])

  if (profile) return null

  return (
    <div className="w-full max-w-sm text-center">
      <Zap className="w-10 h-10 text-violet-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-white mb-2">Welcome to Ascend</h1>
      <p className="text-sm text-gray-400 mb-8">
        Your training data is stored locally on this device.
      </p>
      <div className="space-y-3">
        <Link href="/dashboard">
          <Button size="lg" className="w-full">Continue Training</Button>
        </Link>
        <p className="text-sm text-gray-500">
          No account?{' '}
          <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-medium">
            Get started free
          </Link>
        </p>
      </div>
    </div>
  )
}
