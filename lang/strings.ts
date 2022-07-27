import { EOL } from '../deps.ts';

/**
 * Removes a *single* trailing new line (either LF or CRLF) from the string, if there is one.
 *
 * Note: Unlike the `string.trimEnd()` function, this will not remove any other whitespace
 * characters.
 *
 * @param text The text to be altered
 * @returns The altered text
 */
export function trimTrailingNewline(text: string): string {
  if (text.endsWith(EOL.CRLF)) {
    return stripSuffix(text, EOL.CRLF);
  } else {
    return stripSuffix(text, EOL.LF);
  }
}

/**
 * Removes the specified prefix from the string if it exists.
 *
 * @param text The text to be altered
 * @param prefix The prefix to remove from the text
 * @returns The altered text
 */
export function stripPrefix(text: string, prefix: string): string {
  return text.startsWith(prefix) ? text.substring(prefix.length) : text;
}

/**
 * Removes the specified suffix from the string if it exists.
 *
 * @param text The text to be altered
 * @param suffix The suffix to remove from the text
 * @returns The altered text
 */
export function stripSuffix(text: string, suffix: string): string {
  return text.endsWith(suffix) ? text.substring(0, text.length - suffix.length) : text;
}

/**
 * Reformats text with the leading/trailing newlines and largest common line indentations removed.
 *
 * @param text The string to be reformatted
 * @returns The formatted string
 *
 * @example
 * const generatedCode = trimAndDedent(`
 *   service ${serviceName} {
 *     rpc Delete${subjectName}(Delete${subjectName}Request) returns (Delete${subjectName}Response);
 *     rpc Create${subjectName}(Create${subjectName}Request) returns (Create${subjectName}Response);
 *   }
 * `);
 */
export function trimAndDedent(text: string): string {
  // Trim off empty lines at beginning
  let alteredText = text.replace(INITIAL_EMPTY_LINES_PATTERN, '');

  // Find indent on first line and trim that prefix off of each line
  const initialIndent = alteredText.match(INITIAL_INDENT_PATTERN);
  alteredText = alteredText.replaceAll(
    new RegExp('^' + initialIndent, 'mg'),
    '',
  );

  // Trim off empty lines at end
  return alteredText.trimEnd();
}

const INITIAL_EMPTY_LINES_PATTERN = /^[\n\r]+/;
const INITIAL_INDENT_PATTERN = /^\s*/;
