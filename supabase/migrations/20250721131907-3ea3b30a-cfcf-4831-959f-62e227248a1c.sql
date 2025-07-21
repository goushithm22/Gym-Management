-- Create missing tables that the components expect

-- Diet plans table
CREATE TABLE public.diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  description TEXT,
  meal_plan TEXT,
  calories_per_day INTEGER DEFAULT 0,
  diet_type TEXT DEFAULT 'weight-loss',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Supplements table
CREATE TABLE public.supplements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'protein',
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update bills table to match component expectations
ALTER TABLE public.bills 
ADD COLUMN IF NOT EXISTS fee_package TEXT,
ADD COLUMN IF NOT EXISTS billing_period TEXT;

-- Update bills table to use the right field names
UPDATE public.bills 
SET fee_package = 'basic', 
    billing_period = period_start || ' - ' || period_end
WHERE fee_package IS NULL;

-- Add RLS policies for diet_plans
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view diet plans for their gym" 
ON public.diet_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage diet plans" 
ON public.diet_plans 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add RLS policies for supplements
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view supplements" 
ON public.supplements 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage supplements" 
ON public.supplements 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add RLS policies for bills
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bills" 
ON public.bills 
FOR SELECT 
USING (
  member_id IN (
    SELECT id FROM public.members 
    WHERE email = (
      SELECT email FROM public.profiles 
      WHERE id = auth.uid()
    )
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'reception')
  )
);

CREATE POLICY "Admins can manage bills" 
ON public.bills 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add RLS policies for members
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members" 
ON public.members 
FOR SELECT 
USING (
  email = (
    SELECT email FROM public.profiles 
    WHERE id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'reception')
  )
);

CREATE POLICY "Admins can manage members" 
ON public.members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications" 
ON public.notifications 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage notifications" 
ON public.notifications 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add missing fields to members table if needed
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'basic';

-- Create some sample data for demo accounts
INSERT INTO public.profiles (id, email, role, full_name) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@fitgym.com', 'admin', 'Admin User'),
  ('00000000-0000-0000-0000-000000000002', 'member@fitgym.com', 'member', 'Member User'),
  ('00000000-0000-0000-0000-000000000003', 'reception@fitgym.com', 'reception', 'Reception User')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.members (id, email, full_name, phone, address, membership_type, package_type, status)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'member@fitgym.com', 'Member User', '+1234567890', '123 Main St', 'basic', 'basic', 'active')
ON CONFLICT (id) DO NOTHING;