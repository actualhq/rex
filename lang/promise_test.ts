import { assertEquals } from '../testing_deps.ts';
import { promised } from './promise.ts';

async function writeTestFile(data: string): Promise<string> {
  const filename = await Deno.makeTempFile({ prefix: 'deno-test' });
  await Deno.writeTextFile(filename, data);
  return filename;
}

Deno.test('promise properties are resolved', async () => {
  // Arrange
  const file1 = await writeTestFile('declare');
  const file2 = await writeTestFile('implement');

  // Act
  const file = {
    lang: 'cpp',
    headers: Deno.readTextFile(file1),
    impl: Deno.readTextFile(file2),
  };
  const fileContents = await promised(file);

  // Assert
  assertEquals(fileContents.headers, 'declare');
  assertEquals(fileContents.impl, 'implement');
});

Deno.test('non-promise properties are kept', async () => {
  // Arrange
  const file1 = await writeTestFile('declare');
  const file2 = await writeTestFile('implement');

  // Act
  const file = {
    lang: 'cpp',
    headers: Deno.readTextFile(file1),
    impl: Deno.readTextFile(file2),
  };
  const fileContents = await promised(file);

  // Assert
  assertEquals(fileContents.lang, 'cpp');
});
