-- Fix RLS policies for all tables to ensure proper access control

-- First, let's check the existing table structure and fix the profiles policies
-- The profiles table uses 'id' column to reference auth.uid(), not 'user_id'

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create proper RLS policies for profiles table using the correct column name
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create a security definer function to get user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Fix RLS policies for other tables to use proper role-based access
-- Note: members table doesn't have user_id column, so we need to add basic policies

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view all bills" ON public.bills;
DROP POLICY IF EXISTS "Users can insert bills" ON public.bills;
DROP POLICY IF EXISTS "Users can update bills" ON public.bills;
DROP POLICY IF EXISTS "Users can delete bills" ON public.bills;

DROP POLICY IF EXISTS "Users can view all members" ON public.members;
DROP POLICY IF EXISTS "Users can insert members" ON public.members;
DROP POLICY IF EXISTS "Users can update members" ON public.members;
DROP POLICY IF EXISTS "Users can delete members" ON public.members;

DROP POLICY IF EXISTS "Users can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete notifications" ON public.notifications;

-- Create secure RLS policies for bills table
CREATE POLICY "Admin and reception can manage all bills" 
ON public.bills 
FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'reception'));

-- Create secure RLS policies for members table
CREATE POLICY "Admin and reception can manage all members" 
ON public.members 
FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'reception'));

-- Create secure RLS policies for notifications table
CREATE POLICY "Admin can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can view relevant notifications" 
ON public.notifications 
FOR SELECT 
USING (
  target_audience = 'all' OR 
  target_audience = public.get_current_user_role()
);