import {NextRequest,NextResponse} from 'next/server';
import {createServerSupabase} from '@/lib/supabase/server';
import {isConfigured,siteUrl} from '@/lib/env';
export async function GET(request:NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') === '/actualizar-password' ? '/actualizar-password' : '/dashboard';
  if (isConfigured() && code) {
    const supabase = await createServerSupabase(true);
    try {
      const {error} = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next,siteUrl()));
    } catch {}
  }
  return NextResponse.redirect(new URL('/login?link_error=1',siteUrl()));
}
