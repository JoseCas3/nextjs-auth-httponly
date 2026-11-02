import {AuthShell} from '@/components/auth-shell';
import {AuthForm} from '@/components/auth-form';
import {requireUser} from '@/lib/auth';
export const metadata={title:'Nueva contraseña',robots:{index:false,follow:false}};
export default async function UpdatePassword(){await requireUser(); return <AuthShell eyebrow="UN ACCESO RENOVADO" title="Elige tu nueva contraseña." description="Al terminar, volverás a iniciar sesión. Usa una contraseña única que no utilices en otros sitios."><AuthForm mode="password"/></AuthShell>;}
