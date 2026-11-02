import type {ActionState} from './validation';
export function recoveryResult(error:{status?:number;code?:string}|null):ActionState {
  if (error?.status===429 || error?.code==='over_email_send_rate_limit' || error?.code==='over_request_rate_limit') {
    return {error:'El servicio de correo alcanzó su límite de solicitudes. Espera antes de solicitar otro enlace; los intentos repetidos no aceleran el envío.'};
  }
  if (error) return {error:'No pudimos tramitar la recuperación en este momento. Inténtalo más tarde.'};
  return {success:'Si existe una cuenta con ese correo, recibirás instrucciones para recuperar el acceso.'};
}
