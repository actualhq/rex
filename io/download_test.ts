import { downloadFile, downloadFileToTempDir } from './download.ts';
import { crypto, iterateReader, path } from '../deps.ts';
import {
  assertEquals,
  assertInstanceOf,
  assertNotEquals,
  createStaticTestHttpServer,
  createTestHttpServer,
  deterministicByteArray,
  fail,
  fileAttachmentHeaders,
} from '../testing_deps.ts';

const TEST_FILE_CONTENTS = 'testing 1 2 3...';

Deno.test('downloads text file', async () => {
  const testServer = createStaticTestHttpServer(TEST_FILE_CONTENTS);

  const downloadedFile = await downloadFileToTempDir(testServer.urlOrigin);

  const fileContents = await Deno.readTextFile(downloadedFile);
  assertEquals(fileContents, TEST_FILE_CONTENTS);

  await testServer.close();
  await Deno.remove(downloadedFile);
});

Deno.test('downloads binary file', async () => {
  // 32MB feels sufficiently large to test some buffering, but not large enough to be obnoxious?
  const binaryData = deterministicByteArray(32 * 1024 * 1024);
  const expectedHash = new Uint8Array(await crypto.subtle.digest('SHA-256', binaryData));
  const testServer = createStaticTestHttpServer(binaryData);

  const downloadedFile = await downloadFileToTempDir(testServer.urlOrigin);

  const file = await Deno.open(downloadedFile, { read: true });
  try {
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', iterateReader(file)));
    assertEquals(hash, expectedHash);
  } finally {
    await testServer.close();
    file.close();
    await Deno.remove(downloadedFile);
  }
});

Deno.test('still works with no sensible default filename', async () => {
  const testServer = createStaticTestHttpServer(TEST_FILE_CONTENTS);

  const downloadedFile = await downloadFile({
    url: testServer.urlOrigin,
    downloadLocation: { specialDir: 'temp' },
  });

  try {
    const baseFilename = path.basename(downloadedFile);
    assertNotEquals(baseFilename, '');
  } finally {
    await testServer.close();
    await Deno.remove(downloadedFile);
  }
});

Deno.test('uses end of URL path for default filename', async () => {
  const testServer = createStaticTestHttpServer(TEST_FILE_CONTENTS);

  const downloadedFile = await downloadFile({
    url: testServer.urlOrigin + '/foo/bar/test_file.txt',
    downloadLocation: { specialDir: 'temp' },
  });

  try {
    const baseFilename = path.basename(downloadedFile);
    assertEquals(baseFilename, 'test_file.txt');
  } finally {
    await testServer.close();
    await Deno.remove(downloadedFile);
  }
});

Deno.test('removes query params from default filename', async () => {
  const testServer = createStaticTestHttpServer(TEST_FILE_CONTENTS);

  const downloadedFile = await downloadFile({
    url: testServer.urlOrigin + '/download?os=darwin',
    downloadLocation: { specialDir: 'temp' },
  });

  try {
    const baseFilename = path.basename(downloadedFile);
    assertEquals(baseFilename, 'download');
  } finally {
    await testServer.close();
    await Deno.remove(downloadedFile);
  }
});

Deno.test('uses attachment for filename if present', async () => {
  const testServer = createStaticTestHttpServer(
    TEST_FILE_CONTENTS,
    { headers: fileAttachmentHeaders('text', 'totally_real_file.txt') },
  );

  const downloadedFile = await downloadFile({
    url: testServer.urlOrigin + '/foo/bar/test_file.txt',
    downloadLocation: { specialDir: 'temp' },
  });

  try {
    const baseFilename = path.basename(downloadedFile);
    assertEquals(baseFilename, 'totally_real_file.txt');
  } finally {
    await testServer.close();
    await Deno.remove(downloadedFile);
  }
});

Deno.test('uses specified filename if present', async () => {
  const testServer = createStaticTestHttpServer(
    TEST_FILE_CONTENTS,
    { headers: fileAttachmentHeaders('text', 'totally_real_file.txt') },
  );

  const downloadedFile = await downloadFile({
    url: testServer.urlOrigin + '/foo/bar/test_file.txt',
    downloadLocation: { specialDir: 'temp', filename: 'obviously_fake_file.txt' },
  });

  try {
    const baseFilename = path.basename(downloadedFile);
    assertEquals(baseFilename, 'obviously_fake_file.txt');
  } finally {
    await testServer.close();
    await Deno.remove(downloadedFile);
  }
});

Deno.test('throws on error status code', async () => {
  const testServer = createTestHttpServer(() => new Response('', { status: 404 }));

  let downloadedFile = '';

  try {
    downloadedFile = await downloadFileToTempDir(testServer.urlOrigin + '/foo/bar/test_file.txt');
    fail(`Should have thrown on 404, but wrote file: ${downloadFile}`);
  } catch (err) {
    assertInstanceOf(err, Deno.errors.Http);
  } finally {
    await testServer.close();
    if (downloadedFile) {
      await Deno.remove(downloadedFile);
    }
  }
});

Deno.test('follows redirects', async () => {
  const testServer = createTestHttpServer((req) => {
    if (new URL(req.url).pathname === '/') {
      return new Response(TEST_FILE_CONTENTS, { status: 200 });
    } else {
      return new Response('', { status: 307, headers: { 'Location': '/' } });
    }
  });

  const downloadedFile = await downloadFileToTempDir(testServer.urlOrigin + '/foo.txt');

  const fileContents = await Deno.readTextFile(downloadedFile);
  assertEquals(fileContents, TEST_FILE_CONTENTS);

  await testServer.close();
  await Deno.remove(downloadedFile);
});

Deno.test('uses original URL for default filename in redirects', async () => {
  const testServer = createTestHttpServer((req) => {
    if (new URL(req.url).pathname === '/') {
      return new Response(TEST_FILE_CONTENTS, { status: 200 });
    } else {
      return new Response('', { status: 307, headers: { 'Location': '/' } });
    }
  });

  const downloadedFile = await downloadFileToTempDir(testServer.urlOrigin + '/test_file.txt');

  try {
    const baseFilename = path.basename(downloadedFile);
    assertEquals(baseFilename, 'test_file.txt');
  } finally {
    await testServer.close();
    await Deno.remove(downloadedFile);
  }
});
