-- Simple column additions without complex constraints
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'basic';
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.supplements ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.diet_plans ADD COLUMN IF NOT EXISTS calories_per_day INTEGER DEFAULT 0;
ALTER TABLE public.diet_plans ADD COLUMN IF NOT EXISTS diet_type TEXT DEFAULT 'weight-loss';