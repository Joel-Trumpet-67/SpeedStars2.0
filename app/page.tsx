import Link from 'next/link'
import {
  Target,
  Building2,
  Trophy,
  Calculator,
  Star,
  BarChart2,
  ChevronRight,
  Zap,
  ArrowRight,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Target,
    title: 'Percentage-Based Programming',
    description:
      'Built on proven 5/3/1 methodology. Every set is calculated from your Training Max for consistent, measurable progress.',
  },
  {
    icon: Building2,
    title: 'Planet Fitness Support',
    description:
      'No barbell? No problem. Full Smith machine substitutions and dumbbell alternatives for every movement pattern.',
  },
  {
    icon: Trophy,
    title: 'Rank Progression',
    description:
      'Earn XP every workout. Progress from Recruit to Legend through 11 ranks as you build real strength.',
  },
  {
    icon: Calculator,
    title: 'Auto Weight Calculator',
    description:
      'Enter your 5RM or 1RM — we calculate your Training Max, account for Smith machine ratios, and set every weight.',
  },
  {
    icon: Star,
    title: 'PR Tracking',
    description:
      'Every personal record is logged automatically. Visualize your strength trajectory over time.',
  },
  {
    icon: BarChart2,
    title: 'Advanced Analytics',
    description:
      'Volume, intensity, frequency, and 1RM estimates. Understand your training with clarity.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Set Training Maxes',
    description:
      'Enter your current lifts — whether 1RM, 5RM, or estimated. We calculate your Training Max automatically.',
  },
  {
    number: '02',
    title: 'Generate Your Program',
    description:
      'Choose strength, hypertrophy, powerbuilding, or fat loss. Select 4, 8, 12, or 16 weeks. Done.',
  },
  {
    number: '03',
    title: 'Track & Progress',
    description:
      'Log sets, hit AMRAP, earn XP, break PRs. Your Training Max increases automatically when you outperform targets.',
  },
]

const RANKS = [
  { name: 'Recruit', color: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-600' },
  { name: 'Private', color: 'text-gray-300', bg: 'bg-gray-800', border: 'border-gray-500' },
  { name: 'Corporal', color: 'text-blue-400', bg: 'bg-blue-950', border: 'border-blue-700' },
  { name: 'Sergeant', color: 'text-blue-300', bg: 'bg-blue-950', border: 'border-blue-600' },
  { name: 'Lieutenant', color: 'text-emerald-400', bg: 'bg-emerald-950', border: 'border-emerald-700' },
  { name: 'Captain', color: 'text-emerald-300', bg: 'bg-emerald-950', border: 'border-emerald-600' },
  { name: 'Major', color: 'text-violet-400', bg: 'bg-violet-950', border: 'border-violet-700' },
  { name: 'Colonel', color: 'text-violet-300', bg: 'bg-violet-950', border: 'border-violet-600' },
  { name: 'General', color: 'text-amber-400', bg: 'bg-amber-950', border: 'border-amber-700' },
  { name: 'Elite', color: 'text-orange-400', bg: 'bg-orange-950', border: 'border-orange-700' },
  { name: 'Legend', color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-700' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              ASCEND
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          {/* Social proof strip */}
          <div className="mb-8 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Rank system:</span>
            {['Recruit', 'Sergeant', 'Captain', 'General', 'Legend'].map((rank, i) => (
              <span
                key={rank}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-gray-700 text-gray-400"
              >
                {rank}
              </span>
            ))}
          </div>

          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none mb-6">
            <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              ASCEND
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-400 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
            Train Smarter.{' '}
            <span className="text-gray-300">Progress Faster.</span>{' '}
            <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent font-semibold">
              Rank Higher.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25"
            >
              Start Training Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 font-medium text-lg transition-all duration-200"
            >
              Learn More
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: '11', label: 'Ranks' },
              { value: '4', label: 'Programs' },
              { value: '∞', label: 'Progress' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Everything You Need
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Built for Serious Lifters
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Not another rep counter. Ascend is a complete training system with real programming science.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-violet-800 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 border border-violet-600/20 mb-4 group-hover:bg-violet-600/20 transition-colors">
                    <Icon className="h-6 w-6 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-gray-900/50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Simple Process
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              From setup to your first PR in three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-gray-700 to-transparent z-10" />
                )}
                <div className="p-8 rounded-2xl bg-gray-900 border border-gray-800 h-full">
                  <div className="text-5xl font-black bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rank Showcase */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Progression System
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Earn Your Rank
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Every workout earns XP. Progress through 11 ranks from Recruit to Legend.
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 justify-start lg:justify-center scrollbar-thin">
            {RANKS.map((rank, i) => (
              <div
                key={rank.name}
                className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-xl border ${rank.border} ${rank.bg} min-w-[90px]`}
              >
                <div className={`text-xs font-bold uppercase tracking-wider ${rank.color}`}>
                  {rank.name}
                </div>
                {i < RANKS.length - 1 && (
                  <div className="w-full h-px bg-gray-700" />
                )}
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(i + 1, 5) }).map((_, j) => (
                    <div
                      key={j}
                      className={`h-1.5 w-1.5 rounded-full ${rank.color.replace('text-', 'bg-')}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-gray-900 border border-gray-800">
              <Zap className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-gray-400">
                Earn XP through workouts, PRs, streaks, and program completions
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative p-12 rounded-3xl bg-gray-900 border border-gray-800 text-center overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-3xl border border-violet-600/30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

            {/* Background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-64 w-64 rounded-full bg-violet-600/10 blur-[60px]" />
            </div>

            <div className="relative z-10">
              <Trophy className="h-12 w-12 text-violet-400 mx-auto mb-6" />
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                Ready to Ascend?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                Join lifters who train with purpose. Your first program is free, forever.
              </p>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30"
              >
                Create Free Account
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-4 text-sm text-gray-500">No credit card required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-lg font-black tracking-wider bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            ASCEND
          </span>
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Ascend. Train Smarter. Progress Faster. Rank Higher.
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
