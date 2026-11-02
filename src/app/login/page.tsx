import Link from 'next/link';
import {AuthShell} from '@/components/auth-shell';
import {AuthForm} from '@/components/auth-form';
import {isConfigured} from '@/lib/env';
export const metadata={title:'Iniciar sesión',robots:{index:false,follow:false}};
export default async function Login({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}) {
  const params=await searchParams;
  return <AuthShell eyebrow="QUÉ BUENO VERTE" title="Vuelve a tu espacio." description="Ingresa tus datos para continuar donde lo dejaste." footer={<>¿Es tu primera vez? <Link href="/registro">Crea tu cuenta</Link></>}>
    {params.updated==='1'&&<p className="notice success">Contraseña actualizada. Inicia sesión con la nueva.</p>}{params.link_error==='1'&&<p role="alert" className="notice error">El enlace no es válido o expiró. Solicita uno nuevo.</p>}<AuthForm mode="login" disabled={!isConfigured()}/>
  </AuthShell>;
}
