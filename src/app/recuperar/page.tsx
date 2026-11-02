import Link from 'next/link';
import {AuthShell} from '@/components/auth-shell';
import {AuthForm} from '@/components/auth-form';
import {isConfigured} from '@/lib/env';
export const metadata={title:'Recuperar acceso',robots:{index:false,follow:false}};
export default function Recover(){return <AuthShell eyebrow="VOLVAMOS A EMPEZAR" title="Recupera tu acceso." description="Escribe tu correo y te enviaremos las instrucciones para crear una nueva contraseña." footer={<Link href="/login">← Volver a iniciar sesión</Link>}><AuthForm mode="recover" disabled={!isConfigured()}/></AuthShell>;}
