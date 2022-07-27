import { $ } from './run.ts';

/**
 * Determines whether the specified command is executable in the shell environment.
 *
 * @param command The name of the command to be run
 * @returns A {@link boolean} containing `true` only if the shell reported the command was available
 */
export function commandExists(command: string): Promise<boolean> {
  const script = Deno.build.os === 'windows'
    ? `Get-Command "${command}"`
    : `command -v "${command}"`;
  return $.try(script);
}
