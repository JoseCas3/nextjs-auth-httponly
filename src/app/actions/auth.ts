'use server';
import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {createServerSupabase} from '@/lib/supabase/server';
import {isConfigured,siteUrl} from '@/lib/env';
import {trustedOrigin} from '@/lib/security';
import {loginSchema,registerSchema,recoverySchema,passwordSchema,type ActionState} from '@/lib/validation';

async function guard():Promise<ActionState|undefined> {
  const origin = (await headers()).get('origin');
  if (!trustedOrigin(origin,siteUrl())) return {error:'Solicitud no permitida. Recarga la página e inténtalo de nuevo.'};
  if (!isConfigured()) return {error:'Falta conectar Supabase. Consulta la página de configuración.'};
}
function validationError<T>(parsed:z.ZodSafeParseError<T>):ActionState {
  return {error:'Revisa los campos indicados.',fields:z.flattenError(parsed.error).fieldErrors as Record<string,string[]>};
}
export async function login(_state:ActionState,form:FormData):Promise<ActionState> {
  const denied = await guard(); if (denied) return denied;
  const parsed = loginSchema.safeParse(Object.fromEntries(form)); if (!parsed.success) return validationError(parsed);
  const supabase = await createServerSupabase(true);
  try {
    const {error} = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return {error:'No pudimos iniciar sesión. Revisa tus credenciales y confirma tu correo.'};
  } catch {return {error:'No pudimos conectar. Inténtalo de nuevo más tarde.'};}
  revalidatePath('/','layout'); redirect('/dashboard');
}
export async function register(_state:ActionState,form:FormData):Promise<ActionState> {
  const denied = await guard(); if (denied) return denied;
  const parsed = registerSchema.safeParse(Object.fromEntries(form)); if (!parsed.success) return validationError(parsed);
  const supabase = await createServerSupabase(true);
  try {
    const {error} = await supabase.auth.signUp({email:parsed.data.email,password:parsed.data.password,options:{data:{full_name:parsed.data.name},emailRedirectTo:`${siteUrl()}/auth/callback`}});
    if (error) return {error:'No se pudo completar el registro. Inténtalo más tarde o utiliza recuperar acceso.'};
  } catch {return {error:'No pudimos conectar. Inténtalo de nuevo más tarde.'};}
  // Mismo mensaje con correo existente, evita enumerar cuentas.
  return {success:'Si el correo puede registrarse, recibirás un enlace de confirmación. Revisa también spam.'};
}
export async function recover(_state:ActionState,form:FormData):Promise<ActionState> {
  const denied = await guard(); if (denied) return denied;
  const parsed = recoverySchema.safeParse(Object.fromEntries(form)); if (!parsed.success) return validationError(parsed);
  const supabase = await createServerSupabase(true);
  try {await supabase.auth.resetPasswordForEmail(parsed.data.email,{redirectTo:`${siteUrl()}/auth/callback?next=/actualizar-password`});} catch {}
  return {success:'Si existe una cuenta con ese correo, recibirás instrucciones para recuperar el acceso.'};
}
export async function updatePassword(_state:ActionState,form:FormData):Promise<ActionState> {
  const denied = await guard(); if (denied) return denied;
  const parsed = passwordSchema.safeParse(Object.fromEntries(form)); if (!parsed.success) return validationError(parsed);
  const supabase = await createServerSupabase(true);
  const {data:{user}} = await supabase.auth.getUser(); if (!user) return {error:'El enlace o la sesión expiró. Solicita un nuevo enlace.'};
  try {
    const {error} = await supabase.auth.updateUser({password:parsed.data.password});
    if (error) return {error:'No pudimos actualizar la contraseña. Usa una diferente o solicita otro enlace.'};
    // Cierra las sesiones; el próximo acceso utiliza la nueva contraseña.
    const {error:signOutError} = await supabase.auth.signOut({scope:'global'});
    if (signOutError) return {error:'Contraseña actualizada. No pudimos cerrar todas las sesiones; vuelve a cerrar sesión.'};
  } catch {return {error:'No pudimos completar la operación. Inténtalo más tarde.'};}
  revalidatePath('/','layout'); redirect('/login?updated=1');
}
export async function logout(_state:ActionState,_form:FormData):Promise<ActionState> {
  const denied = await guard(); if (denied) return denied;
  const supabase = await createServerSupabase(true);
  try {const {error} = await supabase.auth.signOut({scope:'local'}); if (error) return {error:'No pudimos cerrar sesión. Inténtalo otra vez.'};} catch {return {error:'No pudimos conectar. Inténtalo de nuevo.'};}
  revalidatePath('/','layout'); redirect('/login');
}
export async function confirmEmail(_state:ActionState,form:FormData):Promise<ActionState> {
  const denied = await guard(); if (denied) return denied;
  const token = form.get('token_hash'); const type = form.get('type');
  if (typeof token !== 'string' || !/^[a-f0-9]{32,128}$/i.test(token) || (type !== 'email' && type !== 'recovery')) return {error:'El enlace no es válido. Solicita uno nuevo.'};
  const supabase = await createServerSupabase(true);
  try {const {error} = await supabase.auth.verifyOtp({token_hash:token,type}); if (error) return {error:'El enlace expiró o ya fue utilizado. Solicita uno nuevo.'};} catch {return {error:'No pudimos verificar el enlace. Inténtalo más tarde.'};}
  revalidatePath('/','layout'); redirect(type === 'recovery' ? '/actualizar-password' : '/dashboard');
}
