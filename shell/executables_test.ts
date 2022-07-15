import { assert, assertRejects } from 'https://deno.land/std@0.144.0/testing/asserts.ts';
import { makeFileExecutable } from './executables.ts';
import { $ } from './run.ts';

Deno.test('new file becomes executable on unix/mac', async () => {
  if (Deno.build.os === 'windows') {
    return;
  }

  const filename = await Deno.makeTempFile();
  Deno.writeTextFile(filename, 'echo "looks good"');
  assertRejects(() => $([filename]), 'File execution succeeded before permission flag was set');

  await makeFileExecutable(filename);
  assert(await $([filename]), 'File execution failed after permission flag was set');
});

Deno.test('does not blow up on windows', async () => {
  if (Deno.build.os !== 'windows') {
    return;
  }

  const filename = await Deno.makeTempFile();
  await makeFileExecutable(filename);
});
