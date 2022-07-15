import { assert, assertFalse } from 'https://deno.land/std@0.144.0/testing/asserts.ts';
import { commandExists } from './commands.ts';

Deno.test('built-in commands return true', async () => {
  const exists = await commandExists('echo');
  assert(exists);
});

Deno.test('names of executables on path return true', async () => {
  const exists = await commandExists('deno');
  assert(exists);
});

Deno.test('unknown names return false', async () => {
  const exists = await commandExists('idonotexist');
  assertFalse(exists);
});
