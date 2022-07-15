import { $ } from './run.ts';

/**
 * Makes a file executable in Linux/Unix/MacOS environments.
 *
 * This includes setting the executable bit on the file, and if on MacOS, unsetting the Apple quarantine bit applied to
 * downloaded files.
 *
 * Note: This method doesn't do anything for Windows. This is because Windows typically decides whether a file is
 * executable based on its file extension.
 *
 * @param executablePath The path to the file to make executable
 */
export async function makeFileExecutable(executablePath: string): Promise<void> {
  if (Deno.build.os === 'windows') {
    // This concept doesn't translate to windows (file just needs to have the appropriate extension)
    return;
  }

  const promises: Promise<unknown>[] = [];
  promises.push($(['chmod', '+x', executablePath]));
  if (Deno.build.os === 'darwin') {
    // Use try so that this is a best effort operation
    promises.push($.try(['xattr', '-d', 'com.apple.quarantine', executablePath]));
  }
  await Promise.all(promises);
}
