export function sessionCookieOptions(production = process.env.NODE_ENV === 'production') {
  return {httpOnly:true, secure:production, sameSite:'lax' as const, path:'/'};
}
export function trustedOrigin(origin:string|null, expected:string):boolean {
  if (!origin || origin === 'null') return false;
  try {return new URL(origin).origin === new URL(expected).origin;} catch {return false;}
}
export function contentSecurityPolicy(nonce:string, production:boolean, supabaseUrl?:string):string {
  let supabaseOrigin = '';
  try {supabaseOrigin = new URL(supabaseUrl || '').origin;} catch {}
  return ["default-src 'self'",`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${production ? '' : " 'unsafe-eval'"}`,"style-src 'self' 'unsafe-inline'","img-src 'self' data:","font-src 'self'",`connect-src 'self' ${supabaseOrigin}${production ? '' : ' ws: wss:'}`,"object-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'none'",...(production ? ['upgrade-insecure-requests'] : [])].join('; ');
}
