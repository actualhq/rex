export {
  assert,
  assertEquals,
  assertFalse,
  assertInstanceOf,
  assertNotEquals,
  assertRejects,
  fail,
} from 'https://deno.land/std@0.150.0/testing/asserts.ts';

import { Server } from 'https://deno.land/std@0.150.0/http/server.ts';
import { randomPort } from 'https://deno.land/x/getport@v2.1.2/mod.ts';
import { isNil } from './deps.ts';
import { checkExhaustive } from './lang/types.ts';

/** A simple HTTP server that can be manipulated for testing. */
export interface TestServer {
  urlOrigin: string;
  close: () => Promise<void>;
}

/** Creates HTTP headers for serving a file download/attachment. */
export function fileAttachmentHeaders(
  fileEncoding: 'binary' | 'text',
  filename?: string,
): Record<string, string> {
  const headers: Record<string, string> = {};
  switch (fileEncoding) {
    case 'binary':
      headers['Content-Type'] = 'application/octet-stream';
      break;
    case 'text':
      headers['Content-Type'] = 'text/plain';
      break;
    default:
      checkExhaustive(fileEncoding);
      break;
  }
  const attachmentSuffix = isNil(filename) ? '' : `; filename="${filename}"`;
  headers['Content-Disposition'] = 'attachment' + attachmentSuffix;
  return headers;
}

export function createStaticTestHttpServer(body: BodyInit, params: ResponseInit = {}): TestServer {
  return createTestHttpServer(() => {
    return new Response(body, { ...params, status: 200 });
  });
}

/** Creates an HTTP server for testing that uses the supplied handler for all requests. */
export function createTestHttpServer(handler: (req: Request) => Response): TestServer {
  const hostName = '0.0.0.0';
  const testServerPort = randomPort(hostName);
  const server = new Server({
    port: testServerPort,
    handler,
  });
  const servingFinished = server.listenAndServe();
  return {
    urlOrigin: `http://${hostName}:${testServerPort}`,
    close: () => {
      server.close();
      return servingFinished;
    },
  };
}

/** Creates a deterministic array of binary data with the specified number of bytes. */
export function deterministicByteArray(size: number): Uint8Array {
  const buffer: number[] = [];
  for (let i = 0; i < size; i++) {
    buffer.push((size - i) % 256);
  }
  return new Uint8Array(buffer);
}
