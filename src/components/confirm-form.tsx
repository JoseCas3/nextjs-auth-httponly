'use client';
import {useActionState} from 'react';
import {confirmEmail} from '@/app/actions/auth';
import type {ActionState} from '@/lib/validation';
export function ConfirmForm({tokenHash,type}:{tokenHash:string;type:string}) {
  const [state,action,pending] = useActionState<ActionState,FormData>(confirmEmail,{});
  return <form action={action}><input type="hidden" name="token_hash" value={tokenHash}/><input type="hidden" name="type" value={type}/>{state.error && <p className="notice error" role="alert">{state.error}</p>}<button className="button primary full" disabled={pending}>{pending?'Verificando…':'Confirmar y continuar'} <span aria-hidden="true">↗</span></button></form>;
}
