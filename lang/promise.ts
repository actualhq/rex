/**
 * Allow all properties in type `T` to optionally have a {@link Promise} value.
 *
 * Use `await promised(obj) to translate a `Promised<T>` into a `T`.
 */
export type Promised<T extends Record<string, unknown>> = {
  [P in keyof T]: T[P] | Promise<T[P]>;
};

/**
 * Awaits the value for each property in an object and then returns a record with the values.
 *
 * @example
 * You might resolve a record of file promises into a record of file contents.
 * Before:
 * ```
 * {
 *   'foo.txt': Promise<string>,
 *   'foo.shasum': Promise<string>,
 * }
 * ```
 * After:
 * ```
 * {
 *   'foo.txt': 'a foo is a thing that does stuff',
 *   'foo.shasum': 'c6feec83aa2ef60c68bb91d384c356dced2a3704e9769991be6b5baf4e382e91',
 * }
 * ```
 *
 * @example
 * ```typescript
 * function readFiles(...filePaths: string[]): Promise<Record<string, string>> {
 *   const promisedFiles: Record<string, Promise<string>> = {};
 *   filePaths.forEach(path => promisedFiles[path] = Deno.readTextFile(path));
 *   return promised(promisedFiles);
 * }
 * const fileContents = await readFiles('foo.txt', 'foo.shasum');
 * ```
 *
 * @param obj The {@link Promised} object, where any property could be a {@link Promise}
 * @returns The {@link Awaited}
 */
export async function promised<
  T extends Record<string, unknown>,
  K extends keyof T,
  V extends T[K],
>(obj: Promised<T>): Promise<T> {
  const promisedEntries = Object.entries(obj) as PromisedEntry<K, V>[];
  const awaitedEntries: Entry<K, V>[] = [];
  for (const entry of promisedEntries) {
    awaitedEntries.push([entry[0], await entry[1]]);
  }
  return Object.fromEntries(awaitedEntries) as T;
}

type Entry<K, V> = [K, V];
type PromisedEntry<K, V> = Entry<K, V | Promise<V>>;
