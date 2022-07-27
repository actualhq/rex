import { $ } from './run.ts';

/**
 * Makes a file executable in Linux/Unix/MacOS environments by setting the executable bit.
 *
 * Note: This method does nothing on Windows. This is because Windows typically decides whether a file is
 * executable based on its file extension.
 *
 * @param executablePath The path to the file to make executable
 */
export async function makeFileExecutable(executablePath: string): Promise<void> {
  if (Deno.build.os === 'windows') {
    // This concept doesn't translate to windows (file just needs to have the appropriate extension)
    return;
  }

  await $(['chmod', '+x', executablePath]);
}

/**
 * Unsets the Apple quarantine bit applied to downloaded files.
 *
 * Note: This method does nothing on non-Mac platforms.
 *
 * @param filePath The path to the file to make executable
 */
export async function removeAppleQuarantine(filePath: string): Promise<void> {
  if (Deno.build.os !== 'darwin') {
    // This concept doesn't translate to non-Mac platforms
    return;
  }

  await $(['xattr', '-d', 'com.apple.quarantine', filePath]);
}
