import { isPiped, PipedProcessResult, ProcessResult } from './run_types.ts';

/**
 * Contains an error caused by trying to run a process.
 *
 * This provides the {@link ProcessResult} object and summarizes that information in the `message` property of the
 * error.
 */
export class ProcessError extends Error {
  constructor(readonly result: ProcessResult) {
    super(
      `Process exited with return code of: ${result.status.code}` +
        ProcessError.summarize(result),
    );
  }
  private static summarize(result: ProcessResult | PipedProcessResult): string {
    if (!isPiped(result) || typeof result.stdout !== 'string') {
      return '';
    }
    let message = '';
    if (result.stderr.length > 0) {
      message += '\n' + result.stderr;
    }
    if (result.stdout.length > 0) {
      message += '\n' + result.stdout;
    }
    return message;
  }
}
