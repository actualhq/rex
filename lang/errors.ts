/**
 * Runs the specified function and returns its result or the error thrown.
 *
 * @param work The function to be executed
 * @returns A `T` containing the return value of the function if it succeded, or the {@link Error} thrown if it failed
 */
export function attempt<T>(work: () => T): T | Error {
  try {
    return work();
  } catch (err) {
    return err;
  }
}
