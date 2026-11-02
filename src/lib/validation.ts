import {z} from 'zod';
const email = z.email('Escribe un correo válido.').max(254);
const password = z.string().min(12,'Usa al menos 12 caracteres.').max(128,'Máximo 128 caracteres.').regex(/[a-zA-Z]/,'Incluye letras.').regex(/[0-9]/,'Incluye números.');
export const loginSchema = z.object({email,password:z.string().min(1,'Escribe tu contraseña.').max(128)});
export const registerSchema = z.object({name:z.string().trim().min(2,'Escribe tu nombre.').max(80),email,password,confirmPassword:z.string()}).refine(v=>v.password===v.confirmPassword,{message:'Las contraseñas no coinciden.',path:['confirmPassword']});
export const recoverySchema = z.object({email});
export const passwordSchema = z.object({password,confirmPassword:z.string()}).refine(v=>v.password===v.confirmPassword,{message:'Las contraseñas no coinciden.',path:['confirmPassword']});
export type ActionState = {error?:string;success?:string;fields?:Record<string,string[]|undefined>};
