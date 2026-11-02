import Link from 'next/link';
import {requireUser} from '@/lib/auth';
import {LogoutButton} from '@/components/logout-button';
export const metadata={title:'Mi espacio',robots:{index:false,follow:false}};
export default async function Dashboard() {
  const {user,supabase}=await requireUser();
  const {data:profile,error}=await supabase.from('profiles').select('id,full_name,created_at').eq('id',user.id).maybeSingle();
  const name=profile?.full_name || 'Tu cuenta';
  return <main className="dashboard"><p className="eyebrow"><span className="status-dot"/> TU ESPACIO PERSONAL</p><div className="dashboard-heading"><div><h1>Bienvenido, {name}<span>.</span></h1><p>Todo empieza aquí. Esta es la información de tu cuenta.</p></div><span className="pill">Sesión activa ✓</span></div><div className="dashboard-grid"><section className="profile-card"><div className="section-heading"><h2>Mi perfil</h2><span>01</span></div><div className="avatar" aria-hidden="true">{name.slice(0,1).toUpperCase()}</div><h3>{name}</h3><p className="muted">Un espacio solo para ti.</p><dl><div><dt>Correo electrónico</dt><dd>{user.email}</dd></div><div><dt>Estado del correo</dt><dd>{user.email_confirmed_at?'Verificado ✓':'Pendiente de confirmación'}</dd></div><div><dt>Miembro desde</dt><dd>{new Intl.DateTimeFormat('es',{dateStyle:'long',timeZone:'UTC'}).format(new Date(user.created_at))}</dd></div></dl>{error&&<p className="notice error">No pudimos cargar tu perfil de base de datos. Inténtalo más tarde o revisa la migración de Supabase.</p>}</section><aside className="account-card"><p className="eyebrow">TRANQUILIDAD, INCLUIDA</p><h2>Tu cuenta.<br/>Tu control.</h2><p>Actualiza tu contraseña cuando lo necesites y cierra sesión al usar un equipo compartido.</p><Link href="/actualizar-password" className="button secondary full">Cambiar contraseña ↗</Link><LogoutButton/><div className="account-mark" aria-hidden="true">u.</div></aside></div></main>;
}
