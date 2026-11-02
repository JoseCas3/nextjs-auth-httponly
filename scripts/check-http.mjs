import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
try {process.loadEnvFile('.env.local');} catch {}
const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
for (const path of ['/', '/login', '/registro', '/recuperar', '/privacidad', '/configuracion']) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status,200,path);
  assert.equal(response.headers.get('x-frame-options'),'DENY');
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  assert.equal(response.headers.get('referrer-policy'),'no-referrer');
  assert.match(response.headers.get('content-security-policy') || '', /script-src .*'nonce-/);
  assert.match(response.headers.get('cache-control') || '',/no-store/);
  assert.ok((await response.text()).includes('Umbral'));
  console.log(`OK ${path}: HTTP 200, CSP, no-store y headers de seguridad`);
}
for (const path of ['/dashboard','/actualizar-password']) {
  const response = await fetch(`${base}${path}`,{redirect:'manual'});
  assert.equal(response.status,307,path);
  assert.equal(new URL(response.headers.get('location'),base).pathname,configured?'/login':'/configuracion');
  console.log(`OK ${path}: acceso denegado sin sesión`);
}
const confirmation = await fetch(`${base}/auth/confirm?token_hash=invalid&type=recovery`);
assert.ok((await confirmation.text()).includes('El enlace está incompleto'));
const callback = await fetch(`${base}/auth/callback?next=https://attacker.example`,{redirect:'manual'});
assert.equal(callback.status,307);
assert.equal(new URL(callback.headers.get('location'),base).pathname,'/login');
assert.equal(new URL(callback.headers.get('location'),base).host,new URL(base).host);
console.log('OK confirmación inválida y callback sin redirección externa');
