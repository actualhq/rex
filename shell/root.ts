import { $ } from './run.ts';

/**
 * Checks to see if the process is being run as a root user.
 *
 * Note: This is currently not implemented for Windows and will just throw.
 *
 * @returns A {@link boolean} that will be `true` if running with root privileges
 */
export async function isRoot(): Promise<boolean> {
  if (Deno.build.os === 'windows') {
    throw new Error('Root detection not implemented for Windows.');
  }
  const result = await $(['id', '-u']);
  return result === '0';
}
