# Umbral — Autenticación segura con Next.js y Supabase

- Aplicación publicada: https://umbral-josecas3.vercel.app
- Repositorio de la actividad: https://github.com/JoseCas3/nextjs-auth-httponly
- Estado: despliegue de producción verificado; falta completar las URLs de correo de producción en Supabase y comprobar registro/recuperación con un correo real.

Actividad práctica: App Router, TypeScript, Server Actions, cookies httpOnly y protección de rutas. Interfaz en español y adaptable a móvil. Requiere un proyecto propio de Supabase para usar cuentas reales.

## Inicio rápido con Docker Desktop en Windows

No necesitas instalar Node en Windows. Abre Docker Desktop y ejecuta en PowerShell desde esta carpeta:

```powershell
Copy-Item .env.example .env.local
docker compose run --rm web npm ci
docker compose up -d
```

Visita http://localhost:3000. Si todavía no has conectado Supabase, podrás ver las páginas, pero los formularios aparecerán deshabilitados y el dashboard redirigirá a `/configuracion`. Esto **no es una autenticación simulada**: las cuentas necesitan Supabase real.

Después de cambiar `.env.local`, reinicia con `docker compose restart web`. Para detener conservando dependencias: `docker compose down`. Logs: `docker compose logs --tail=50 web`. No publiques `.env.local`.

Alternativa con Node.js 22 instalado:

```sh
npm ci
npm run dev
```

## 1. Crear y configurar Supabase

1. Crea una cuenta en https://supabase.com/dashboard y un nuevo proyecto. Guarda la contraseña de base de datos en tu gestor de contraseñas; la app no la necesita.
2. En el proyecto, copia **Project URL** y la clave **publishable** desde las opciones de conexión/API Keys. También funciona la clave pública legacy `anon`. Nunca uses `service_role` ni `sb_secret_...`.
3. Completa `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Abre SQL Editor y ejecuta todo `supabase/migrations/001_profiles.sql`. Crea perfiles, trigger de alta y política RLS. Usuarios autenticados solo pueden leer su propio perfil; usuarios anónimos no tienen acceso. El trigger crea el perfil desde `auth.users`.
5. En Authentication habilita Email y **Confirm email**. Configura una contraseña mínima de 12 caracteres. Activa las protecciones de contraseñas filtradas y CAPTCHA si tu plan/caso lo permite. La app también valida 12–128 caracteres con letras y números en cliente y servidor.
6. En URL Configuration usa `http://localhost:3000` como Site URL durante desarrollo. Añade `http://localhost:3000/auth/callback` y `http://localhost:3000/auth/callback?next=/actualizar-password` a las Redirect URLs. Al publicar usa el dominio HTTPS de producción como Site URL y añade sus dos callbacks exactos. Mantén localhost solo si seguirás desarrollando. No uses comodines de dominios ajenos.
7. Ajusta las plantillas de correo como se indica abajo y reinicia el servidor local.

### Plantillas de correo (recomendadas para abrir enlaces en cualquier navegador)

En Authentication → Email Templates → Confirm signup, utiliza:

```html
<h2>Confirma tu correo en Umbral</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirmar mi correo</a></p>
```

En Reset password:

```html
<h2>Recupera tu acceso a Umbral</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Elegir una nueva contraseña</a></p>
```

El GET muestra una pantalla intermedia. El usuario pulsa un botón que consume el token mediante una **Server Action POST**; los escáneres que abren enlaces no consumen el token con un simple GET. Se envía `Referrer-Policy: no-referrer`, no se incluyen scripts de terceros y la página no es indexable. El hash es una credencial temporal: no lo compartas ni registres sus query strings en tu infraestructura.

También existe `/auth/callback` para canjear un `code` PKCE desde el navegador que inició el flujo. Solo permite destinos internos fijos. El flujo no utiliza tokens en fragmentos de URL ni los copia al navegador. Para la entrega usa las plantillas anteriores; si pruebas local y producción con el mismo proyecto, recuerda que `.SiteURL` corresponde al dominio configurado en Supabase.

El correo incluido en Supabase tiene restricciones de envío y destinatarios. Si las pruebas con otros usuarios no reciben mensajes, configura un proveedor SMTP propio desde Supabase y comprueba sus límites de Auth. No desactives las confirmaciones para ocultar un fallo de entrega. SMTP y datos de usuarios son configuración externa, no secretos que se deban añadir al repositorio.

## 2. Cómo probar la aplicación

1. `/registro`: crea una cuenta con correo real y contraseña válida. Prueba confirmación incorrecta y correo inválido: deben mostrar errores.
2. Abre el correo, pulsa el enlace y luego «Confirmar y continuar». Debes llegar a `/dashboard` con tu perfil creado en PostgreSQL.
3. Intenta abrir `/login` o `/registro` autenticado: el Proxy redirige al dashboard.
4. Cierra sesión. Acceder directamente a `/dashboard` debe redirigir a `/login`. Sus Server Components también verifican al usuario, incluso si se omite el Proxy.
5. Inicia sesión con una contraseña incorrecta: muestra un error seguro. Con la correcta: accede al dashboard.
6. `/recuperar`: solicita un enlace, abre el correo, confirma y elige una nueva contraseña. Tras actualizarla se solicita cerrar globalmente las sesiones y se redirige al login. Prueba la contraseña nueva. Los JWT ya emitidos pueden seguir vigentes hasta su expiración; esto depende de Supabase, no de borrar localStorage.
7. En DevTools → Application → Cookies, busca las cookies `sb-...` (pueden estar divididas en partes): deben tener HttpOnly, SameSite=Lax, Path=/ y Secure en producción HTTPS. `document.cookie` no debe mostrar esas cookies y Local Storage no debe contener tokens.
8. Para comprobar renovación, deja que expire el access token según la duración configurada en Supabase y vuelve a navegar: Proxy debe renovar las cookies antes del render. Comprueba también cookies eliminadas al salir. No cambies arbitrariamente el vencimiento del refresh token en el navegador.
9. Con dos cuentas, comprueba RLS en Supabase: cada sesión debe leer únicamente su perfil; una consulta anónima no puede leerlos. La política se aplica en PostgreSQL, no solo en la interfaz.

Comprobaciones automatizadas:

```powershell
docker compose run --rm web npm run typecheck
docker compose run --rm web npm test
docker compose run --rm -e NEXT_PUBLIC_SITE_URL=https://tu-dominio.example web npm run build
```

Las pruebas unitarias cubren cookies, origen CSRF, CSP y validación de registro/contraseña. No sustituyen las pruebas con Auth, correo, PostgreSQL y renovación reales. GitHub Actions ejecutará tipos, pruebas y build al publicar el repositorio.

## Arquitectura y decisiones de seguridad

| Requisito | Implementación |
| --- | --- |
| Next.js 16+, App Router, TypeScript | `src/app`, tipos estrictos, lockfile |
| Registro, login, recuperación, logout | `src/app/actions/auth.ts`, Server Actions |
| Server Components y Actions | `src/lib/supabase/server.ts`, cliente SSR con cookies de solo lectura o escritura explícita |
| Route Handlers | `src/app/auth/callback/route.ts`, usa el cliente SSR con escritura |
| Middleware | `src/proxy.ts` y `src/lib/supabase/proxy.ts` |
| Dashboard privado | Proxy + `requireUser()` en layout y página; `getUser()` valida con Auth |
| Database | perfiles en PostgreSQL, trigger y RLS |
| Navegación condicional | `src/components/navigation.tsx` |
| Validación y UX | Zod compartido, atributos HTML, `useActionState`, mensajes de carga/error |
| SEO | metadata, robots, sitemap, páginas privadas noindex |

**Middleware en Next.js 16:** la convención oficial es `proxy.ts`, que reemplaza `middleware.ts`. No hay dos archivos compitiendo por la misma petición. Proxy renueva con `getUser`, actualiza el Cookie de la petición para Server Components y conserva Set-Cookie también al redirigir. Se usa `private, no-store` para evitar cachear respuestas con sesión.

**httpOnly y cliente del navegador:** el patrón habitual con `createBrowserClient` de `@supabase/ssr` necesita que JavaScript lea las cookies para autenticar llamadas directas. Eso contradice la prohibición de tokens accesibles por JavaScript del enunciado. Aquí `@supabase/ssr` gestiona la sesión **solo en servidor**. `src/lib/supabase/client.ts` configura un cliente de navegador **anónimo**, sin persistencia, renovación ni detección de sesión por URL, destinado únicamente a datos públicos con RLS. Las pantallas de autenticación son Client Components que invocan Server Actions. Nunca se llama a Auth desde el cliente anónimo ni se le entrega el JWT. Cualquier dato privado pasa por el servidor.

**Cookies:** httpOnly siempre, SameSite=Lax y Secure en producción. En desarrollo HTTP se desactiva únicamente Secure para que localhost funcione. Para producción se exige `NEXT_PUBLIC_SITE_URL` HTTPS. Los cambios de cookies conservan los parámetros de borrado y duración que proporciona Supabase.

**CSRF:** las mutaciones son Server Actions POST, protegidas por la comprobación de origen/host de Next.js y una verificación adicional contra la URL canónica de la app. Orígenes ausentes, `null` o externos se rechazan. SameSite es defensa adicional, no el único control. No se habilitan comodines de `allowedOrigins`. El callback GET solo canjea códigos PKCE y restringe el destino; los enlaces token_hash se consumen mediante POST.

**XSS:** React escapa el texto del usuario; no hay HTML sin sanitizar ni `dangerouslySetInnerHTML`. CSP usa nonce por petición para scripts, bloquea objetos y frames. En desarrollo permite `unsafe-eval` para herramientas de Next; producción lo elimina. Los estilos inline están permitidos para compatibilidad visual. httpOnly dificulta el robo del token, pero no impide todas las acciones que podría ejecutar un XSS; por eso se mantienen CSP y escape.

**Credenciales y errores:** se usan únicamente URL y clave pública con RLS. No hay service_role, contraseñas en logs ni sesiones enviadas como props al cliente. Recuperación mantiene un mensaje uniforme para evitar enumerar cuentas; Supabase puede responder de forma distinta según su configuración de confirmación, por lo que debe permanecer activada. Límites de correo/login se configuran en Supabase; no se implementa un contador en memoria que dejaría de funcionar en múltiples instancias.

## 3. Publicar el repositorio y desplegar en Vercel

El repositorio y el despliegue necesitan acceso a tus cuentas; no están creados automáticamente por tener los archivos locales.

1. Crea un repositorio público nuevo, por ejemplo `nextjs-auth-httponly`. No reutilices `biblioteca-api`, que corresponde a otra actividad.
2. Si no tienes Git, instala Git para Windows; abre una terminal nueva. Desde esta carpeta:

```sh
git init
git add .
git status
git commit -m "Implementa autenticación segura con Next.js y Supabase"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/nextjs-auth-httponly.git
git push -u origin main
```

Comprueba que `.env.local`, `.next` y `node_modules` están excluidos; sí se publica `.env.example`, la migración SQL y `package-lock.json`.

3. En Vercel importa ese repositorio. Selecciona Next.js y Node 22. Build `npm run build`; instalación `npm ci`.
4. Configura las tres variables de `.env.example` en Vercel. La URL del sitio debe ser el dominio público HTTPS definitivo, por ejemplo `https://tu-proyecto.vercel.app`. Si cambias el dominio, actualiza esa variable y vuelve a desplegar.
5. Actualiza Site URL, callbacks y plantillas en Supabase para ese dominio. Usa un proyecto Supabase separado para entornos si necesitas probar correos simultáneamente en localhost y producción.
6. Despliega, revisa Checks y realiza el recorrido de prueba anterior por HTTPS. Verifica Secure en las cookies y que los formularios no muestran errores de origen.
7. Entrega **el enlace público de GitHub y el enlace público de Vercel**. No entregues este README como evidencia de un despliegue que aún no se ha realizado.

## Referencias oficiales

- https://nextjs.org/docs/app/getting-started/proxy
- https://nextjs.org/docs/app/guides/data-security
- https://nextjs.org/docs/app/guides/content-security-policy
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/auth/server-side/advanced-guide
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Estado de entrega

Código preparado para conectar a Supabase. La configuración de la cuenta, ejecución de la migración en Supabase y entrega de correos deben verificarse con el proyecto del alumno. Las verificaciones locales realizadas se registran en `VERIFICACION.md`.
