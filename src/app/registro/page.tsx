import Link from 'next/link';
import {AuthShell} from '@/components/auth-shell';
import {AuthForm} from '@/components/auth-form';
import {isConfigured} from '@/lib/env';
export const metadata={title:'Crear cuenta',robots:{index:false,follow:false}};
export default function Register(){return <AuthShell eyebrow="UN NUEVO COMIENZO" title="Haz espacio para ti." description="Crea tu cuenta. Te enviaremos un enlace para confirmar tu correo." footer={<>¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></>}><AuthForm mode="register" disabled={!isConfigured()}/></AuthShell>;}
