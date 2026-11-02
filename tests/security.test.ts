import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionCookieOptions,trustedOrigin,contentSecurityPolicy} from '../src/lib/security';
import {registerSchema,passwordSchema} from '../src/lib/validation';
test('cookies de producción no son legibles por JS y requieren HTTPS',()=>{
  assert.deepEqual(sessionCookieOptions(true),{httpOnly:true,secure:true,sameSite:'lax',path:'/'});
  assert.equal(sessionCookieOptions(false).httpOnly,true);
  assert.equal(sessionCookieOptions(false).secure,false);
});
test('CSRF: rechaza origen ausente, null, subdominio y dominio similar',()=>{
  const expected='https://umbral.example';
  for(const origin of [null,'null','https://umbral.example.attacker.com','https://otro.umbral.example','http://umbral.example','bad']) assert.equal(trustedOrigin(origin,expected),false);
  assert.equal(trustedOrigin(expected,expected),true);
});
test('CSP de producción requiere nonce y bloquea objetos y frames',()=>{
  const policy=contentSecurityPolicy('nonce-test',true,'https://demo.supabase.co');
  assert.ok(policy.includes("'nonce-nonce-test'"));
  assert.ok(policy.includes("object-src 'none'"));
  assert.ok(policy.includes("frame-ancestors 'none'"));
  assert.ok(!policy.includes("'unsafe-eval'"));
  assert.ok(!policy.includes("script-src 'unsafe-inline'"));
});
test('registro valida correo, longitud, letras/números y confirmación',()=>{
  const valid={name:'Ana Pérez',email:'ana@example.com',password:'MiPassword12345',confirmPassword:'MiPassword12345'};
  assert.equal(registerSchema.safeParse(valid).success,true);
  for(const changes of [{email:'incorrecto'},{password:'corta'},{password:'abcdefghijkl',confirmPassword:'abcdefghijkl'},{confirmPassword:'diferente'},{name:'A'}]) assert.equal(registerSchema.safeParse({...valid,...changes}).success,false);
  assert.equal(passwordSchema.safeParse({password:valid.password,confirmPassword:'otra'}).success,false);
});
