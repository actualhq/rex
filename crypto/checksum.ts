import { crypto, hex, iterateReader } from '../deps.ts';

type DigestAlgorithm = Parameters<typeof crypto.subtle.digest>[0];

/**
 * Computes the hash for the specified file.
 *
 * @param filePath The file to be hashed
 * @param algorithm The digest algorithm to use when computing the hash
 * @returns A {@link string} containing the hash in hexadecimal format
 */
export async function fileChecksumHex(
  filePath: string,
  algorithm: DigestAlgorithm = 'SHA-256',
): Promise<string> {
  const file = await Deno.open(filePath, { read: true });
  try {
    return await checksumHex(iterateReader(file), algorithm);
  } finally {
    file.close();
  }
}

/**
 * Computes the hash for the specified text or binary data.
 *
 * @param data The data to be hashed
 * @param algorithm The digest algorithm to use when computing the hash
 * @returns A {@link string} containing the hash in hexadecimal format
 */
export async function checksumHex(
  data: string | BufferSource | AsyncIterable<BufferSource> | Iterable<BufferSource>,
  algorithm: DigestAlgorithm = 'SHA-256',
): Promise<string> {
  const binaryData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const bufferedHash = await crypto.subtle.digest(algorithm, binaryData);
  const hash = new Uint8Array(bufferedHash);
  return new TextDecoder().decode(hex.encode(hash));
}
