import 'server-only';
import {redirect} from 'next/navigation';
import {isConfigured} from '@/lib/env';
import {createServerSupabase} from '@/lib/supabase/server';
export async function requireUser() {
  if (!isConfigured()) redirect('/configuracion');
  const supabase = await createServerSupabase();
  const {data:{user},error} = await supabase.auth.getUser();
  if (error || !user) redirect('/login');
  return {user,supabase};
}
