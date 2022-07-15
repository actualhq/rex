import { EOL } from 'https://deno.land/std@0.145.0/fs/eol.ts';
import { isNil } from './values.ts';

/**
 * Removes a trailing new line (either LF or CRLF) from the string if there is one.
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
 * Formats the template string with the leading/trailing newlines and largest common line indentations removed.
 *
 * This is useful for multiline template strings.
 *
 * @example
 * const generatedCode = trimAndDedent`
 *   service ${serviceName} {
 *     rpc Delete${subjectName}(Delete${subjectName}Request) returns (Delete${subjectName}Response);
 *     rpc Create${subjectName}(Create${subjectName}Request) returns (Create${subjectName}Response);
 *   }
 * `;
 */
export function trimAndDedent(literals: TemplateStringsArray, ...values: string[]): string {
  let alteredText = renderTemplateString(literals, ...values);
  // Trim off empty lines at beginning
  alteredText = alteredText.replace(INITIAL_EMPTY_LINES_PATTERN, '');

  // Find indent on first line and trim that prefix off of each line
  const initialIndent = alteredText.match(INITIAL_INDENT_PATTERN);
  alteredText = alteredText.replaceAll(
    new RegExp('^' + initialIndent, 'mg'),
    '',
  );

  // Trim off empty lines at end
  return alteredText.trimEnd();
}

function renderTemplateString(literals: TemplateStringsArray, ...values: string[]): string {
  const buffer: string[] = [];
  for (let i = 0; i < literals.length; i++) {
    buffer.push(literals[i]);
    if (!isNil(values[i])) {
      buffer.push(String(values[i]));
    }
  }
  return buffer.join('');
}

const INITIAL_EMPTY_LINES_PATTERN = /^[\n\r]+/;
const INITIAL_INDENT_PATTERN = /^\s*/;
