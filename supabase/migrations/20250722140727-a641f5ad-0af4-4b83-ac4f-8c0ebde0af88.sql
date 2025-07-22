-- Fix missing columns step by step

-- Add missing columns to members table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'address') THEN
    ALTER TABLE public.members ADD COLUMN address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'membership_type') THEN
    ALTER TABLE public.members ADD COLUMN membership_type TEXT DEFAULT 'basic';
  END IF;
END $$;

-- Add missing columns to supplements table  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'stock') THEN
    ALTER TABLE public.supplements ADD COLUMN stock INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplements' AND column_name = 'status') THEN
    ALTER TABLE public.supplements ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Add missing columns to notifications table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'status') THEN
    ALTER TABLE public.notifications ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Add missing columns to diet_plans table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diet_plans' AND column_name = 'calories_per_day') THEN
    ALTER TABLE public.diet_plans ADD COLUMN calories_per_day INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diet_plans' AND column_name = 'diet_type') THEN
    ALTER TABLE public.diet_plans ADD COLUMN diet_type TEXT DEFAULT 'weight-loss';
  END IF;
END $$;

-- Insert some sample data
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