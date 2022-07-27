export type RunType = 'piped' | 'streamed';

interface RunOptionsExtension {
  /** Whether to throw if the process returns an error status code. Defaults to true. */
  throwOnError?: boolean;
  /** Whether to trim off a new line at the end of the piped output, if one exists. Defaults to true. */
  trimTrailingNewline?: boolean;
}

/** All run options built into Deno plus extension options provided by this library. */
export type FullRunOptions = Deno.RunOptions & RunOptionsExtension;

/** All of {@link FullRunOptions} except for `cmd`, which this library separates from options. */
export type FullUserRunOptions = Omit<FullRunOptions, 'cmd'>;

/** All of {@link FullUserRunOptions} except for I/O piping, which this library tries to keep separate from options. */
export type UserRunOptions = Omit<FullRunOptions, 'cmd' | 'stdout' | 'stderr' | 'stdin'>;

/** All of {@link UserRunOptions} except for error handling behavior, which is hard-coded by the try strategy. */
export type UserTryOptions = Omit<UserRunOptions, 'throwOnError'>;

/** Generic status for the result of a completed process. */
export interface ProcessResult {
  status: Deno.ProcessStatus;
}
/** Status for the result of a completed process that includes its piped stdout and stderr. */
export interface PipedProcessResult extends ProcessResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
}

/** Gets whether the {@link ProcessResult} has its output piped. */
export function isPiped(result: ProcessResult): result is PipedProcessResult {
  return 'stdout' in result;
}
