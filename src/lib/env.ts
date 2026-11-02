export function isConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Configura las variables públicas de Supabase.');
  return {url,key};
}
export function siteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const url = new URL(value);
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('Producción requiere NEXT_PUBLIC_SITE_URL con HTTPS.');
  return url.origin;
}
