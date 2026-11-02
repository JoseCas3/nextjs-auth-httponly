'use client';
import {useActionState,useState} from 'react';
import Link from 'next/link';
import {login,register,recover,updatePassword} from '@/app/actions/auth';
import {loginSchema,registerSchema,recoverySchema,passwordSchema,type ActionState} from '@/lib/validation';

type Mode = 'login'|'register'|'recover'|'password';
const settings = {
  login:{action:login,schema:loginSchema,button:'Entrar a mi espacio',pending:'Iniciando sesión…'},
  register:{action:register,schema:registerSchema,button:'Crear mi cuenta',pending:'Creando cuenta…'},
  recover:{action:recover,schema:recoverySchema,button:'Enviar instrucciones',pending:'Enviando…'},
  password:{action:updatePassword,schema:passwordSchema,button:'Guardar contraseña',pending:'Guardando…'}
};
export function AuthForm({mode,disabled=false}:{mode:Mode;disabled?:boolean}) {
  const options = settings[mode];
  const [state,action,pending] = useActionState<ActionState,FormData>(options.action,{});
  const [clientError,setClientError] = useState<string>();
  const fields = state.fields || {};
  return <form action={action} onSubmit={event=>{
    const result = options.schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.success) {event.preventDefault();setClientError(result.error.issues[0]?.message);} else setClientError(undefined);
  }}>
    <fieldset disabled={pending||disabled}>
      {mode==='register' && <div className="field"><label htmlFor="name">Nombre completo</label><input id="name" name="name" placeholder="Tu nombre" autoComplete="name" minLength={2} maxLength={80} required aria-describedby={fields.name?'name-error':undefined}/>{fields.name && <small id="name-error" className="field-error">{fields.name[0]}</small>}</div>}
      {mode!=='password' && <div className="field"><label htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" maxLength={254} required aria-describedby={fields.email?'email-error':undefined}/>{fields.email && <small id="email-error" className="field-error">{fields.email[0]}</small>}</div>}
      {mode!=='recover' && <div className="field"><div className="label-row"><label htmlFor="password">{mode==='password'?'Nueva contraseña':'Contraseña'}</label>{mode==='login' && <Link href="/recuperar">¿La olvidaste?</Link>}</div><input id="password" name="password" type="password" placeholder={mode==='login'?'Tu contraseña':'Al menos 12 caracteres'} autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='login'?1:12} maxLength={128} required aria-describedby="password-help"/><small id="password-help">{fields.password?.[0] || (mode==='login'?'':'Usa 12 o más caracteres, con letras y números.')}</small></div>}
      {(mode==='register'||mode==='password') && <div className="field"><label htmlFor="confirmPassword">Confirmar contraseña</label><input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repite tu contraseña" autoComplete="new-password" minLength={12} maxLength={128} required/>{fields.confirmPassword && <small className="field-error">{fields.confirmPassword[0]}</small>}</div>}
      <div aria-live="polite">{(clientError||state.error) && <p className="notice error" role="alert">{clientError||state.error}</p>}{state.success && <p className="notice success">{state.success}</p>}</div>
      <button className="button primary full" type="submit">{pending?options.pending:options.button}<span aria-hidden="true">↗</span></button>
    </fieldset>
    {disabled && <p className="notice">Falta conectar Supabase. <Link href="/configuracion">Ver instrucciones</Link></p>}
  </form>;
}
