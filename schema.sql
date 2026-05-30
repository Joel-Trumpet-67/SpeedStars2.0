-- ============================================================
-- Ascend Fitness App — Full Supabase PostgreSQL Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,1),
  age INTEGER,
  experience_level TEXT NOT NULL DEFAULT 'beginner'
    CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  goals TEXT[] NOT NULL DEFAULT '{}',
  planet_fitness_mode BOOLEAN NOT NULL DEFAULT false,
  xp INTEGER NOT NULL DEFAULT 0,
  rank TEXT NOT NULL DEFAULT 'Recruit',
  streak INTEGER NOT NULL DEFAULT 0,
  last_workout_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- training_maxes
CREATE TABLE IF NOT EXISTS training_maxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  bench_barbell DECIMAL(6,2) NOT NULL DEFAULT 0,
  squat_barbell DECIMAL(6,2) NOT NULL DEFAULT 0,
  deadlift DECIMAL(6,2) NOT NULL DEFAULT 0,
  ohp_barbell DECIMAL(6,2) NOT NULL DEFAULT 0,
  bench_smith DECIMAL(6,2),
  squat_smith DECIMAL(6,2),
  ohp_smith DECIMAL(6,2),
  bench_ratio DECIMAL(4,3) NOT NULL DEFAULT 1.0,
  squat_ratio DECIMAL(4,3) NOT NULL DEFAULT 1.0,
  ohp_ratio DECIMAL(4,3) NOT NULL DEFAULT 1.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- programs
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('strength', 'hypertrophy', 'powerbuilding', 'fat_loss')),
  duration_weeks INTEGER NOT NULL
    CHECK (duration_weeks IN (4, 8, 12, 16)),
  current_week INTEGER NOT NULL DEFAULT 1,
  current_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'paused')),
  planet_fitness_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- workout_logs
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  week INTEGER NOT NULL,
  day INTEGER NOT NULL,
  name TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  total_volume DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- personal_records
CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  estimated_1rm DECIMAL(6,2) NOT NULL,
  equipment TEXT NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- achievements (global, not per-user)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  condition_type TEXT NOT NULL,
  condition_exercise TEXT,
  condition_value DECIMAL(10,2) NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common'
    CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

-- user_achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

-- xp_logs
CREATE TABLE IF NOT EXISTS xp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_completed_at ON workout_logs(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON personal_records(exercise_name);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON xp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_programs_user_id ON programs(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_maxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- training_maxes policies
CREATE POLICY "Users can manage own training maxes"
  ON training_maxes FOR ALL
  USING (auth.uid() = user_id);

-- programs policies
CREATE POLICY "Users can manage own programs"
  ON programs FOR ALL
  USING (auth.uid() = user_id);

-- workout_logs policies
CREATE POLICY "Users can manage own workout logs"
  ON workout_logs FOR ALL
  USING (auth.uid() = user_id);

-- personal_records policies
CREATE POLICY "Users can manage own personal records"
  ON personal_records FOR ALL
  USING (auth.uid() = user_id);

-- achievements policies (public read)
CREATE POLICY "Anyone can read achievements"
  ON achievements FOR SELECT
  USING (true);

-- user_achievements policies
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- xp_logs policies
CREATE POLICY "Users can manage own xp logs"
  ON xp_logs FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  -- Insert training maxes with defaults
  INSERT INTO public.training_maxes (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_training_maxes_updated_at
  BEFORE UPDATE ON training_maxes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED ACHIEVEMENTS
-- ============================================================

INSERT INTO achievements (name, description, icon, xp_reward, condition_type, condition_exercise, condition_value, rarity)
VALUES
  ('First Rep', 'Complete your first workout', '🎯', 100, 'workout_count', NULL, 1, 'common'),
  ('Ten Strong', 'Complete 10 workouts', '💪', 200, 'workout_count', NULL, 10, 'common'),
  ('Century', 'Complete 100 workouts', '💯', 1000, 'workout_count', NULL, 100, 'rare'),
  ('Iron Will', 'Complete 500 workouts', '🔩', 5000, 'workout_count', NULL, 500, 'legendary'),
  ('Week Streak', '7-day workout streak', '🔥', 300, 'streak', NULL, 7, 'common'),
  ('Month Streak', '30-day workout streak', '⚡', 1000, 'streak', NULL, 30, 'rare'),
  ('225 Club', 'Bench press 225 lbs', '🥈', 500, 'pr_weight', 'bench', 225, 'rare'),
  ('315 Bench', 'Bench press 315 lbs', '🥇', 1000, 'pr_weight', 'bench', 315, 'epic'),
  ('315 Squat', 'Squat 315 lbs', '🦵', 500, 'pr_weight', 'squat', 315, 'rare'),
  ('405 Deadlift', 'Deadlift 405 lbs', '💀', 500, 'pr_weight', 'deadlift', 405, 'rare'),
  ('500 Deadlift', 'Deadlift 500 lbs', '🐉', 1500, 'pr_weight', 'deadlift', 500, 'legendary'),
  ('Program Finisher', 'Complete a full program', '🎖️', 500, 'program_complete', NULL, 1, 'rare'),
  ('First PR', 'Set your first personal record', '⭐', 200, 'pr_count', NULL, 1, 'common'),
  ('Centurion', 'Earn 10000 total XP', '👑', 500, 'xp_total', NULL, 10000, 'epic')
ON CONFLICT (name) DO NOTHING;
