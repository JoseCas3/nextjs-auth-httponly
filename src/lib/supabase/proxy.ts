import {createServerClient} from '@supabase/ssr';
import {NextResponse,type NextRequest} from 'next/server';
import {isConfigured,supabaseEnv} from '@/lib/env';
import {sessionCookieOptions,contentSecurityPolicy} from '@/lib/security';
import type {Database} from '@/lib/database.types';

export async function updateSession(request:NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = contentSecurityPolicy(nonce,process.env.NODE_ENV === 'production',process.env.NEXT_PUBLIC_SUPABASE_URL);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce',nonce);
  requestHeaders.set('Content-Security-Policy',csp);
  let response = NextResponse.next({request:{headers:requestHeaders}});
  const finish = (result:NextResponse) => {
    result.headers.set('Content-Security-Policy',csp);
    result.headers.set('Cache-Control','private, no-store, max-age=0');
    return result;
  };
  const path = request.nextUrl.pathname;
  const privatePath = path === '/dashboard' || path.startsWith('/dashboard/') || path === '/actualizar-password';
  if (!isConfigured()) {
    if (privatePath) return finish(NextResponse.redirect(new URL('/configuracion',request.url)));
    return finish(response);
  }
  const {url,key} = supabaseEnv();
  const supabase = createServerClient<Database>(url,key,{
    cookieOptions:sessionCookieOptions(),
    cookies:{getAll:()=>request.cookies.getAll(),setAll(values){
      for (const {name,value} of values) request.cookies.set(name,value);
      requestHeaders.set('cookie',request.headers.get('cookie') || '');
      const previous = response.cookies.getAll();
      response = NextResponse.next({request:{headers:requestHeaders}});
      for (const cookie of previous) response.cookies.set(cookie);
      for (const {name,value,options} of values) response.cookies.set(name,value,{...options,...sessionCookieOptions()});
    }}
  });
  // getUser verifica la sesión con Auth; no confiar en getSession para autorizar.
  const {data:{user}} = await supabase.auth.getUser();
  let destination:string|undefined;
  if (!user && privatePath) destination = '/login';
  if (user && (path === '/login' || path === '/registro')) destination = '/dashboard';
  if (destination) {
    const redirect = NextResponse.redirect(new URL(destination,request.url));
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return finish(redirect);
  }
  return finish(response);
}
