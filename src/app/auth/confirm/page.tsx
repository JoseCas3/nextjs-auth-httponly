import {AuthShell} from '@/components/auth-shell';
import {ConfirmForm} from '@/components/confirm-form';
import Link from 'next/link';
export const metadata={title:'Confirmar correo',robots:{index:false,follow:false}};
export default async function Confirm({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}) {
  const params=await searchParams; const token=params.token_hash; const type=params.type;
  const valid=typeof token==='string'&&/^[a-f0-9]{32,128}$/i.test(token)&&(type==='email'||type==='recovery');
  return <AuthShell eyebrow="UN PASO MÁS" title={type==='recovery'?'Recupera tu cuenta.':'Confirma tu correo.'} description="Pulsa el botón para verificar el enlace. Nunca compartas este enlace con otras personas.">{valid?<ConfirmForm tokenHash={token!} type={type!}/>:<p className="notice error">El enlace está incompleto. <Link href="/recuperar">Solicita uno nuevo</Link>.</p>}</AuthShell>;
}
