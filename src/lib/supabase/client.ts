'use client';
import {createClient} from '@supabase/supabase-js';
import {supabaseEnv} from '@/lib/env';
import type {Database} from '@/lib/database.types';

// Cliente ANÓNIMO: nunca recibe la sesión httpOnly ni se usa para autenticar.
// Cualquier acceso privado se realiza mediante Server Components/Actions.
export function createPublicBrowserSupabase() {
  const {url,key} = supabaseEnv();
  return createClient<Database>(url,key,{
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
  });
}
