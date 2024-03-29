import { assert, assertRejects } from '../testing_deps.ts';
import { makeFileExecutable } from './executables.ts';
import { $ } from './run.ts';

Deno.test({
  name: 'new file becomes executable on linux/mac',
  ignore: Deno.build.os === 'windows',
}, async () => {
  const filename = await Deno.makeTempFile();
  Deno.writeTextFile(filename, 'echo "looks good"');
  assertRejects(() => $([filename]), 'File execution succeeded before permission flag was set');

  await makeFileExecutable(filename);
  assert(await $([filename]), 'File execution failed after permission flag was set');
});

Deno.test({
  name: 'does not blow up on windows',
  ignore: Deno.build.os !== 'windows',
}, async () => {
  const filename = await Deno.makeTempFile();
  await makeFileExecutable(filename);
});
