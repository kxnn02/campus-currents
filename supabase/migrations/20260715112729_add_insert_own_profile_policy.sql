CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO public WITH CHECK (( SELECT auth.uid() AS uid) = id);;
