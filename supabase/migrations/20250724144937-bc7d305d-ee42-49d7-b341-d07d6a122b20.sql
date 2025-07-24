-- Fix RLS policies for all tables to ensure proper access control

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create proper RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for bills table (admin and reception can manage, members can view their own)
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and reception can view all bills" 
ON public.bills 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'reception')
  )
);

CREATE POLICY "Members can view their own bills" 
ON public.bills 
FOR SELECT 
USING (
  member_id IN (
    SELECT id FROM public.members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admin and reception can manage bills" 
ON public.bills 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'reception')
  )
);

-- Add RLS policies for members table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and reception can view all members" 
ON public.members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'reception')
  )
);

CREATE POLICY "Users can view their own member record" 
ON public.members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admin and reception can manage members" 
ON public.members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'reception')
  )
);

-- Add RLS policies for notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Users can view notifications targeted to them" 
ON public.notifications 
FOR SELECT 
USING (
  target_audience = 'all' OR 
  target_audience IN (
    SELECT role FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);