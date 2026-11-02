import Link from 'next/link';
import {isConfigured} from '@/lib/env';
import {createServerSupabase} from '@/lib/supabase/server';
import {LogoutButton} from '@/components/logout-button';
export async function Navigation() {
  let authenticated = false;
  if (isConfigured()) {
    try {const supabase=await createServerSupabase(); const {data:{user}}=await supabase.auth.getUser(); authenticated=Boolean(user);} catch {}
  }
  return <header className="header"><Link className="brand" href="/" aria-label="Umbral, inicio"><span className="brand-icon" aria-hidden="true">u.</span>umbral<span className="brand-dot">●</span></Link><nav aria-label="Navegación principal">{authenticated?<><Link href="/dashboard">Mi espacio</Link><LogoutButton/></>:<><Link className="nav-login" href="/login">Iniciar sesión</Link><Link className="button secondary" href="/registro">Crear cuenta <span aria-hidden="true">↗</span></Link></>}</nav></header>;
}
