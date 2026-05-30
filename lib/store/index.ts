'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ACHIEVEMENTS } from '@/lib/data/achievements'
import { getRankFromXP } from '@/lib/utils/ranks'
import type {
  UserProfile, TrainingMaxes, Program, WorkoutLog,
  PersonalRecord, UserAchievement, ProgramType, ProgramDuration,
  ExperienceLevel, Goal,
} from '@/types'

function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const DEFAULT_TM: TrainingMaxes = {
  id: 'tm-default',
  user_id: '',
  bench_barbell: 0,
  squat_barbell: 0,
  deadlift: 0,
  ohp_barbell: 0,
  bench_ratio: 0.9,
  squat_ratio: 0.9,
  ohp_ratio: 0.9,
  updated_at: new Date().toISOString(),
}

interface AppStore {
  profile: UserProfile | null
  trainingMaxes: TrainingMaxes
  programs: Program[]
  workoutLogs: WorkoutLog[]
  personalRecords: PersonalRecord[]
  userAchievements: UserAchievement[]

  createProfile: (data: {
    display_name: string
    experience_level: ExperienceLevel
    goals: Goal[]
    planet_fitness_mode: boolean
  }) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  setTrainingMaxes: (updates: Partial<Omit<TrainingMaxes, 'id' | 'user_id'>>) => void
  createProgram: (data: {
    name: string
    type: ProgramType
    duration_weeks: ProgramDuration
    planet_fitness_mode: boolean
  }) => Program
  updateProgram: (id: string, updates: Partial<Program>) => void
  logWorkout: (log: Omit<WorkoutLog, 'id' | 'user_id'>) => void
  addPersonalRecord: (pr: Omit<PersonalRecord, 'id' | 'user_id'>) => boolean
  checkAchievements: () => UserAchievement[]
  signOut: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      profile: null,
      trainingMaxes: { ...DEFAULT_TM },
      programs: [],
      workoutLogs: [],
      personalRecords: [],
      userAchievements: [],

      createProfile: (data) => {
        const id = uid()
        const profile: UserProfile = {
          id,
          email: '',
          display_name: data.display_name,
          experience_level: data.experience_level,
          goals: data.goals,
          planet_fitness_mode: data.planet_fitness_mode,
          xp: 0,
          rank: 'Recruit',
          streak: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set({
          profile,
          trainingMaxes: { ...DEFAULT_TM, id: uid(), user_id: id },
        })
      },

      updateProfile: (updates) => {
        const p = get().profile
        if (!p) return
        const newXP = updates.xp ?? p.xp
        set({
          profile: {
            ...p,
            ...updates,
            rank: getRankFromXP(newXP),
            updated_at: new Date().toISOString(),
          },
        })
      },

      setTrainingMaxes: (updates) => {
        set(state => ({
          trainingMaxes: {
            ...state.trainingMaxes,
            ...updates,
            updated_at: new Date().toISOString(),
          },
        }))
      },

      createProgram: (data) => {
        const program: Program = {
          id: uid(),
          user_id: get().profile?.id ?? '',
          name: data.name,
          type: data.type,
          duration_weeks: data.duration_weeks,
          current_week: 1,
          current_day: 1,
          status: 'active',
          planet_fitness_mode: data.planet_fitness_mode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set(state => ({
          programs: [
            ...state.programs.map(p =>
              p.status === 'active' ? { ...p, status: 'paused' as const } : p
            ),
            program,
          ],
        }))
        return program
      },

      updateProgram: (id, updates) => {
        set(state => ({
          programs: state.programs.map(p =>
            p.id === id
              ? { ...p, ...updates, updated_at: new Date().toISOString() }
              : p
          ),
        }))
      },

      logWorkout: (log) => {
        const p = get().profile
        if (!p) return

        const workoutLog: WorkoutLog = {
          id: uid(),
          user_id: p.id,
          ...log,
        }

        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const lastDate = p.last_workout_date
        const newStreak =
          lastDate === yesterday ? p.streak + 1
          : lastDate === today ? p.streak
          : 1

        const newXP = p.xp + log.xp_earned

        set(state => ({
          workoutLogs: [...state.workoutLogs, workoutLog],
          profile: state.profile
            ? {
                ...state.profile,
                xp: newXP,
                rank: getRankFromXP(newXP),
                streak: newStreak,
                last_workout_date: today,
                updated_at: new Date().toISOString(),
              }
            : null,
        }))
      },

      addPersonalRecord: (pr) => {
        const best = get()
          .personalRecords
          .filter(r => r.exercise_name === pr.exercise_name && r.equipment === pr.equipment)
          .sort((a, b) => b.estimated_1rm - a.estimated_1rm)[0]

        if (best && best.estimated_1rm >= pr.estimated_1rm) return false

        const record: PersonalRecord = { id: uid(), user_id: get().profile?.id ?? '', ...pr }
        set(state => ({ personalRecords: [...state.personalRecords, record] }))
        return true
      },

      checkAchievements: () => {
        const state = get()
        if (!state.profile) return []

        const earned = new Set(state.userAchievements.map(ua => ua.achievement_id))
        const newUA: UserAchievement[] = []

        for (const ach of ACHIEVEMENTS) {
          if (earned.has(ach.id)) continue

          let qualifies = false
          switch (ach.condition_type) {
            case 'workout_count':
              qualifies = state.workoutLogs.length >= ach.condition_value
              break
            case 'streak':
              qualifies = state.profile.streak >= ach.condition_value
              break
            case 'pr_weight':
              qualifies = state.personalRecords.some(
                pr =>
                  (ach.condition_exercise
                    ? pr.exercise_name.toLowerCase().includes(ach.condition_exercise)
                    : true) && pr.weight >= ach.condition_value
              )
              break
            case 'program_complete':
              qualifies =
                state.programs.filter(p => p.status === 'completed').length >=
                ach.condition_value
              break
            case 'xp_total':
              qualifies = state.profile.xp >= ach.condition_value
              break
            case 'pr_count':
              qualifies = state.personalRecords.length >= ach.condition_value
              break
          }

          if (qualifies) {
            newUA.push({
              id: uid(),
              user_id: state.profile.id,
              achievement_id: ach.id,
              achievement: ach,
              achieved_at: new Date().toISOString(),
            })
          }
        }

        if (newUA.length > 0) {
          const bonusXP = newUA.reduce((s, ua) => s + ua.achievement.xp_reward, 0)
          const newXP = (state.profile?.xp ?? 0) + bonusXP
          set(s => ({
            userAchievements: [...s.userAchievements, ...newUA],
            profile: s.profile
              ? { ...s.profile, xp: newXP, rank: getRankFromXP(newXP) }
              : null,
          }))
        }

        return newUA
      },

      signOut: () => {
        set({
          profile: null,
          trainingMaxes: { ...DEFAULT_TM, id: uid() },
          programs: [],
          workoutLogs: [],
          personalRecords: [],
          userAchievements: [],
        })
      },
    }),
    {
      name: 'ascend-data',
      version: 1,
    }
  )
)
