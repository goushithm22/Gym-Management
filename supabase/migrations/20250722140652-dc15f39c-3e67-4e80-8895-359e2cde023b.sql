-- Fix missing columns and schema issues

-- Add missing columns to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'basic';

-- Add missing columns to supplements table  
ALTER TABLE public.supplements 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add missing columns to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add missing columns to diet_plans table
ALTER TABLE public.diet_plans 
ADD COLUMN IF NOT EXISTS calories_per_day INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS diet_type TEXT DEFAULT 'weight-loss';

-- Update supplements table column name to match component
ALTER TABLE public.supplements 
RENAME COLUMN stock_quantity TO stock;

-- Fix any duplicate columns that might exist
ALTER TABLE public.supplements DROP COLUMN IF EXISTS stock_quantity;

-- Add proper foreign key relationships
ALTER TABLE public.bills 
ADD CONSTRAINT IF NOT EXISTS bills_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;

ALTER TABLE public.diet_plans 
ADD CONSTRAINT IF NOT EXISTS diet_plans_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;

-- Fix RLS policies for all tables
-- Members policies
DROP POLICY IF EXISTS "Users can view members" ON public.members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.members;

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

-- Bills policies
DROP POLICY IF EXISTS "Users can view their own bills" ON public.bills;
DROP POLICY IF EXISTS "Admins can manage bills" ON public.bills;

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

-- Diet plans policies
DROP POLICY IF EXISTS "Users can view diet plans for their gym" ON public.diet_plans;
DROP POLICY IF EXISTS "Admins can manage diet plans" ON public.diet_plans;

CREATE POLICY "Users can view diet plans" 
ON public.diet_plans 
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

CREATE POLICY "Admins can manage diet plans" 
ON public.diet_plans 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Supplements policies  
DROP POLICY IF EXISTS "Users can view supplements" ON public.supplements;
DROP POLICY IF EXISTS "Admins can manage supplements" ON public.supplements;

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

-- Notifications policies
DROP POLICY IF EXISTS "Users can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;

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

-- Insert some sample data if tables are empty
INSERT INTO public.members (email, full_name, phone, address, membership_type, package_type, status)
VALUES 
  ('member@fitgym.com', 'Member User', '+1234567890', '123 Main St', 'basic', 'basic', 'active'),
  ('john.doe@email.com', 'John Doe', '+1234567891', '456 Oak Ave', 'premium', 'premium', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.supplements (name, description, price, category, stock, status)
VALUES 
  ('Whey Protein', 'High-quality whey protein powder', 49.99, 'protein', 100, 'active'),
  ('Creatine Monohydrate', 'Pure creatine for muscle building', 24.99, 'performance', 50, 'active'),
  ('BCAA Complex', 'Branched-chain amino acids', 34.99, 'recovery', 75, 'active')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.notifications (title, message, type, target_audience, status)
VALUES 
  ('Welcome to FitGym!', 'Welcome to our gym management system', 'general', 'all', 'active'),
  ('Payment Reminder', 'Your monthly payment is due soon', 'payment', 'members', 'active'),
  ('New Class Schedule', 'Check out our updated class schedule', 'announcement', 'all', 'active')
ON CONFLICT (title) DO NOTHING;