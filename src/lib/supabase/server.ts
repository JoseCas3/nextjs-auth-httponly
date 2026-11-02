import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {supabaseEnv} from '@/lib/env';
import {sessionCookieOptions} from '@/lib/security';
import type {Database} from '@/lib/database.types';

export async function createServerSupabase(writable=false) {
  const store = await cookies();
  const {url,key} = supabaseEnv();
  return createServerClient<Database>(url,key,{
    cookieOptions:sessionCookieOptions(),
    cookies:{
      getAll:()=>store.getAll(),
      setAll(values) {
        // Server Components son de solo lectura; Proxy refresca antes del render.
        if (!writable) return;
        for (const {name,value,options} of values) store.set(name,value,{...options,...sessionCookieOptions()});
      }
    }
  });
}
