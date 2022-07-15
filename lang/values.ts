/** Returns true if the value is `null` or `undefined`. */
export function isNil(value: unknown): value is null | undefined {
  return value == null;
}

/**
 * Returns true if the value is `null`, `undefined`, or an empty value.
 *
 * An empty value is any of the following:
 *   * an empty string
 *   * an empty array
 */
export function isEmpty(
  value: string | Array<unknown> | null | undefined,
): value is null | undefined | '' | [] {
  if (isNil(value)) {
    return true;
  } else if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  } else {
    return false;
  }
}
