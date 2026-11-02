'use client';
import {useActionState} from 'react';
import {logout} from '@/app/actions/auth';
import type {ActionState} from '@/lib/validation';
export function LogoutButton() {
  const [state,action,pending] = useActionState<ActionState,FormData>(logout,{});
  return <form action={action}><button className="button secondary" disabled={pending}>{pending?'Saliendo…':'Cerrar sesión'}</button>{state.error&&<small role="alert">{state.error}</small>}</form>;
}
