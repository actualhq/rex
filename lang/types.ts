/**
 * Asserts that the line of code is never executed.
 *
 * This is useful when you want to force a compiler error if a switch statement is not exhaustive.
 *
 * @example
 * switch (architecture) {
 *   case 'arm64':
 *     return false;
 *   case 'x86_64':
 *     return true;
 *   default:
 *     checkExhaustive(architecture);
 * }
 */
export function checkExhaustive<T = unknown>(value: never): T {
  throw new Error(`Non-exhaustive check did not handle ${value}`);
}
