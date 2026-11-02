import test from 'node:test';
import assert from 'node:assert/strict';
import {recoveryResult} from '../src/lib/recovery-result';
test('un límite de correo no se presenta como solicitud aceptada',()=>{
  for(const error of [{status:429},{code:'over_email_send_rate_limit'},{code:'over_request_rate_limit'}]) {
    const result=recoveryResult(error);
    assert.match(result.error||'',/límite/);
    assert.equal(result.success,undefined);
  }
});
test('fallos de envío no se presentan como solicitud aceptada',()=>{
  const result=recoveryResult({status:500});
  assert.ok(result.error);
  assert.equal(result.success,undefined);
});
test('solicitudes aceptadas conservan respuesta sin enumerar usuarios',()=>{
  assert.match(recoveryResult(null).success||'',/Si existe una cuenta/);
});
