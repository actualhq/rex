import { ProcessError } from './process_error.ts';
import {
  FullRunOptions,
  FullUserRunOptions,
  PipedProcessResult,
  ProcessResult,
  UserRunOptions,
  UserTryOptions,
} from './run_types.ts';
import { trimTrailingNewline } from '../lang/strings.ts';
import { isNil } from '../deps.ts';

interface PipedRunOptions extends FullRunOptions {
  stdout: 'piped';
  stderr: 'piped';
}

/**
 * A command to be run by a process.
 *
 * Can either be an array of command + arguments, or a single string with a
 * complete statement that will be forwarded to the shell.
 */
export type ProcessCommand = string | string[];

/**
 * Runs a process and accepts options for handling I/O.
 *
 * By default, this mimics the `$(command)` functionality in BASH, meaning that it pipes all output and returns it as a
 * string.
 *
 * @param command The {@link ProcessCommand} to be run
 * @param options The {@link FullUserRunOptions} governing the behavior of the process runner
 * @returns A {@link string} containing the piped `stdout` from the process
 */
export async function $(
  command: ProcessCommand,
  options: FullUserRunOptions = {},
): Promise<string> {
  const result = await $.piped(buildCommandArray(command), options);
  return result.stdout;
}

/**
 * Runs a process using the generic API.
 *
 * @param command The {@link ProcessCommand} to be run
 * @param options The {@link FullUserRunOptions} governing the behavior of the process runner
 * @returns A {@link Promise<ProcessResult>} containing the result state when the process completes.
 */
$.run = function (
  command: ProcessCommand,
  options: FullUserRunOptions = {},
): Promise<ProcessResult> {
  const fullOptions: FullRunOptions = {
    cmd: buildCommandArray(command),
    ...options,
  };
  return runInternal(fullOptions);
};

/**
 * Runs a process using the piped output API.
 *
 * Note: This is the same as using {@link $} on its own, except that it provides the full process result instead of
 * just the string output.
 *
 * @param command The {@link ProcessCommand} to be run
 * @param options The {@link FullUserRunOptions} governing the behavior of the process runner
 * @returns A {@link Promise<PipedProcessResult>} containing the result state and output when the process completes
 */
$.piped = function (
  command: ProcessCommand,
  options: UserRunOptions = {},
): Promise<PipedProcessResult> {
  const fullOptions: PipedRunOptions = {
    cmd: buildCommandArray(command),
    stdout: 'piped',
    stderr: 'piped',
    ...options,
  };
  return runInternal(fullOptions);
};

/**
 * Runs a process using the streamed output API.
 *
 * This means that output will be sent to the same `stdout`/`stderr` as the Deno script, so it will show up in along with
 * console output.
 *
 * @param command The {@link ProcessCommand} to be run
 * @param options The {@link FullUserRunOptions} governing the behavior of the process runner
 * @returns A {@link Promise<ProcessResult>} containing the result state when the process completes
 */
$.streamed = function (
  command: ProcessCommand,
  options: UserRunOptions = {},
): Promise<ProcessResult> {
  const fullOptions: FullRunOptions = {
    cmd: buildCommandArray(command),
    stdout: 'inherit',
    stderr: 'inherit',
    ...options,
  };
  return runInternal(fullOptions);
};

/**
 * Runs a process and checks to see if it was successful.
 *
 * @param command The {@link ProcessCommand} to be run
 * @param options The {@link FullUserRunOptions} governing the behavior of the process runner
 * @returns A {@link Promise<boolean>} that will resolve to `true` if the process had a zero exit code to indicate success
 */
$.try = async function (
  command: ProcessCommand,
  options: UserTryOptions = {},
): Promise<boolean> {
  try {
    const result = await $.piped(command, { ...options, throwOnError: false });
    return result.status.success;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw err;
    }
  }
};

function runInternal(options: PipedRunOptions): Promise<PipedProcessResult>;
function runInternal(options: FullRunOptions): Promise<ProcessResult>;
async function runInternal(options: FullRunOptions): Promise<ProcessResult> {
  const proc = Deno.run(options);

  const stdoutPromise = options.stdout === 'piped' ? proc.output() : Promise.resolve(undefined);
  const stderrPromise = options.stderr === 'piped'
    ? proc.stderrOutput()
    : Promise.resolve(undefined);

  const [status, stdout, stderr] = await Promise.all([
    proc.status(),
    stdoutPromise,
    stderrPromise,
  ]);

  const result: ProcessResult = { status };
  if (!isNil(stdout) || !isNil(stderr)) {
    const decoder = new TextDecoder();
    const pipedResult = result as PipedProcessResult;
    pipedResult.stdout = decoder.decode(stdout);
    pipedResult.stderr = decoder.decode(stderr);
    if (options.trimTrailingNewline ?? true) {
      pipedResult.stdout = trimTrailingNewline(pipedResult.stdout);
      pipedResult.stderr = trimTrailingNewline(pipedResult.stderr);
    }
  }
  proc.close();

  if (result.status.success || options.throwOnError === false) {
    return result;
  } else {
    throw new ProcessError(result);
  }
}

function buildCommandArray(command: ProcessCommand): string[] {
  if (Array.isArray(command)) {
    return command;
  } else if (Deno.build.os === 'windows') {
    return ['PowerShell.exe', '-Command', command];
  } else {
    return [Deno.env.get('SHELL') ?? '/bin/bash', '-c', command];
  }
}
