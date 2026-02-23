-- Users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro')),
  email_quota_monthly INTEGER NOT NULL DEFAULT 100,
  email_quota_used INTEGER NOT NULL DEFAULT 0,
  quota_reset_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (non-admin fields only handled in app)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Super admins can view all users
CREATE POLICY "super_admin_select_all" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'super_admin'
    )
  );

-- Super admins can update any user
CREATE POLICY "super_admin_update_all" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'super_admin'
    )
  );

-- Reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  first_reminder_at TIMESTAMPTZ NOT NULL,
  repeat_interval_days INTEGER NOT NULL DEFAULT 1,
  current_interval_days INTEGER NOT NULL DEFAULT 1,
  delivery_mode TEXT NOT NULL DEFAULT 'balanced' CHECK (delivery_mode IN ('aggressive', 'balanced', 'gentle')),
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ NOT NULL,
  emails_sent_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused_quota', 'paused_user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own reminders
CREATE POLICY "reminders_select_own" ON public.reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reminders_insert_own" ON public.reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reminders_update_own" ON public.reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reminders_delete_own" ON public.reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger: auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, subscription_tier, email_quota_monthly, email_quota_used, quota_reset_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    'free',
    100,
    0,
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger: auto-update updated_at on reminders
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reminders_updated_at ON public.reminders;

CREATE TRIGGER reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Index for cron job efficiency
CREATE INDEX IF NOT EXISTS idx_reminders_next_send ON public.reminders (next_send_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders (user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
