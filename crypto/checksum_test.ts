import { checksumHex, fileChecksumHex } from './checksum.ts';
import { hex } from '../deps.ts';
import { assertEquals } from '../testing_deps.ts';

const TEST_TEXT_DATA = 'testing 1 2 3...';
const TEST_TEXT_HASH = '2816d302127f4664a9f8de2f71bd42b7897897c80837c9bbce8a9dc60000182c';

const TEST_BINARY_DATA = new TextEncoder().encode(
  '403f3e3d3c3b3a393837363534333231302f2e2d2c2b2a292827262524232221201f1e1d1c1b1a19181716151413',
);
const TEST_BINARY_HASH = 'f9dacbc195283df782d7e5ec525b1d5492dffb2188abb6420a9302c4308538ac';

Deno.test('correctly computes hash for text string', async () => {
  const hash = await checksumHex(TEST_TEXT_DATA);
  assertEquals(hash, TEST_TEXT_HASH);
});

Deno.test('correctly computes hash for text file', async () => {
  const filePath = await Deno.makeTempFile();
  Deno.writeTextFile(filePath, TEST_TEXT_DATA);

  try {
    const hash = await fileChecksumHex(filePath);
    assertEquals(hash, TEST_TEXT_HASH);
  } finally {
    await Deno.remove(filePath);
  }
});

Deno.test('correctly computes hash for binary array', async () => {
  const hash = await checksumHex(TEST_BINARY_DATA);
  assertEquals(hash, TEST_BINARY_HASH);
});

Deno.test('correctly computes hash for binary file', async () => {
  const filePath = await Deno.makeTempFile();
  Deno.writeFile(filePath, TEST_BINARY_DATA);

  try {
    const hash = await fileChecksumHex(filePath);
    assertEquals(hash, TEST_BINARY_HASH);
  } finally {
    await Deno.remove(filePath);
  }
});
