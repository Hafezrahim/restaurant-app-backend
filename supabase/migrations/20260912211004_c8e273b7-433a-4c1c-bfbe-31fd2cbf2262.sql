
CREATE POLICY "media read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');

CREATE POLICY "media avatars insert own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text);

CREATE POLICY "media avatars update own" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text);

CREATE POLICY "media avatars delete own" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text);

CREATE POLICY "media branding admin all" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = 'branding' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')))
WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = 'branding' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')));
