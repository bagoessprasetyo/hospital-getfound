-- Add missing INSERT policy for user_profiles
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Add policy for new users to insert profiles (for signup flow)
CREATE POLICY "Allow signup profile creation" ON user_profiles
    FOR INSERT WITH CHECK (true);

-- Add INSERT policy for patients table
CREATE POLICY "Users can create their own patient profile" ON patients
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Update the handle_new_user function to include role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy to allow viewing of user_profiles during auth process
CREATE POLICY "Allow public profile read during auth" ON user_profiles
    FOR SELECT TO authenticated USING (true);