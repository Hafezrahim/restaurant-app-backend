import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'media';
// Private bucket: we store a long-lived signed URL (10 years) so existing
// string fields (logo_url / avatar_url) keep working.
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

const extOf = (file: File) => {
  const fromName = file.name.split('.').pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return (file.type.split('/')[1] || 'jpg').toLowerCase();
};

/**
 * Uploads an image to the `media` bucket and returns a signed URL.
 * @param folder `avatars/<uid>` or `branding`
 */
export const uploadImage = async (file: File, folder: string): Promise<string> => {
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extOf(file)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) throw error ?? new Error('signed url failed');
  return data.signedUrl;
};
