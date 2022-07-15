import {
  assert,
  assertFalse,
  assertNotEquals,
  assertRejects,
} from 'https://deno.land/std@0.144.0/testing/asserts.ts';
import { $ } from './run.ts';

Deno.test('executables on path can run', async () => {
  const output = await $(['deno', '--version']);
  assertNotEquals(output, '');
});

Deno.test('script statements can run', async () => {
  const output = await $('deno --version');
  assertNotEquals(output, '');
});

Deno.test('built-in commands can run in script statements', async () => {
  const cmd = Deno.build.os === 'windows' ? 'Get-Command "Get-Command"' : 'command -v "command"';
  const output = await $(cmd);
  assertNotEquals(output, '');
});

Deno.test('failed commands throw', async () => {
  await assertRejects(() => $(['printf']));
});

Deno.test('nonexistent commands throw', async () => {
  await assertRejects(() => $(['unknownillegalcommand']));
});

Deno.test('try returns true for successful commands', async () => {
  assert(await $.try(['deno', '--version']));
});

Deno.test('try returns false for failed commands', async () => {
  assertFalse(await $.try(['printf']));
});

Deno.test('try returns false for nonexistent commands', async () => {
  assertFalse(await $.try(['unknownillegalcommand']));
});
