import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="p-5">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Zap className="w-5 h-5 text-violet-500" />
          <span className="text-lg font-black text-white tracking-tight">ASCEND</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  )
}
