-- Fix RLS policy for profiles to allow signup
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Also allow users to insert with the signup flow
CREATE POLICY "Allow insert during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);