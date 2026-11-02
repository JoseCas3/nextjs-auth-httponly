# Verificación local — 2 de noviembre de 2026

## Estado actual de publicación

Vercel: despliegue de producción `dpl_FmX4nMyM7xqkRDpfwB8Pntfsahkh` en estado READY, Node 22. URL pública: https://umbral-josecas3.vercel.app. Despliegue directo del código fuente mediante la conexión autorizada de Vercel; no está conectado automáticamente a GitHub.

La prueba HTTP se ejecutó también contra producción HTTPS y pasó: seis páginas públicas con CSP/cabeceras, dashboard y cambio de contraseña redirigen a login sin sesión, confirmación inválida rechazada y callback restringido. Las notas siguientes conservan la secuencia de verificaciones y sus límites; no representan todas el estado final.

Entorno: Docker Desktop, Node 22, Next.js 16.4.3, `@supabase/ssr` 0.12.7, Supabase JS 2.118.0. Versiones reproducibles en `package-lock.json`.

## Comprobado

- Instalación de dependencias mediante npm en Docker.
- TypeScript estricto: `npm run typecheck` sin errores.
- `npm test`: 4 pruebas aprobadas (cookies httpOnly/Secure/SameSite, origen CSRF, CSP y validación de credenciales).
- Compilación de producción con `NEXT_PUBLIC_SITE_URL` HTTPS.
- `node scripts/check-http.mjs` contra el servidor local sin configurar Supabase: seis páginas públicas responden 200 con CSP y cabeceras de seguridad; dashboard y cambio de contraseña redirigen a configuración; confirmación inválida rechazada; callback no redirige a un dominio externo.
- `npm audit --omit=dev`: cero vulnerabilidades conocidas reportadas en esta ejecución. No equivale a una auditoría integral.
- Inspección en navegador del inicio, formulario de login deshabilitado sin configuración y redirección de dashboard a configuración. La vista observada tenía ancho móvil.

## Pendiente por necesitar cuentas externas

- Crear/conectar un proyecto Supabase y aplicar la migración SQL.
- Registro y login reales, envío y confirmación de correo, recuperación y actualización de contraseña.
- Renovación de sesión con tokens reales y comprobación de Set-Cookie en un despliegue HTTPS.
- Ejecutar pruebas RLS con dos usuarios reales. La migración tiene políticas; todavía no se ejecutó en PostgreSQL.
- Publicar repositorio público y ejecutar GitHub Actions.
- Desplegar en Vercel y comprobar cookies Secure y origen de las Server Actions en el dominio definitivo.

No se utilizan credenciales falsas ni se simula un usuario autenticado para presentar estas comprobaciones como integración real. Los pasos manuales pendientes están documentados en README.md.

## Actualización: Supabase conectado

- Proyecto `acceso-seguro` creado y activo en la organización autorizada por el usuario.
- Migración `initial_profiles` aplicada en PostgreSQL. El trigger privilegiado está en el esquema no expuesto `private`, con EXECUTE revocado a roles públicos.
- Asesor de seguridad de Supabase: sin avisos.
- Prueba transaccional con dos usuarios temporales y rol `authenticated`: el trigger creó ambos perfiles; el rol vio exactamente su perfil y no el ajeno. La transacción se revirtió sin dejar usuarios de prueba.
- API real: Auth responde, Email está habilitado y requiere confirmación. Data API deniega la lectura anónima de perfiles.
- Pruebas HTTP locales con Supabase configurado: rutas privadas redirigen a login sin sesión; cabeceras y callback seguros.
- TypeScript y las cuatro pruebas unitarias siguen pasando.

Quedan pendientes las pruebas de registro/login/recuperación con correo real y renovación con sesión real. Vercel tiene el proyecto `umbral-josecas3` creado, pero solicita autorización del espacio de trabajo antes de configurar sus variables y desplegar. Todavía no hay URL de aplicación publicada ni repositorio nuevo en GitHub.
