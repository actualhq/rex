import { EOL } from '../deps.ts';

/** Any type of OS supported by Deno and potentially returned by {@link Deno.build.os}. */
export type OsType = typeof Deno.build.os;

/**
 * The preferred line ending sequence for the operating system.
 *
 * Note: In some cases, it's better to use {@link EOL.LF} for standardization, even on Windows. Make sure this is the
 * right tool for your use case.
 */
export const SYSTEM_EOL = Deno.build.os === 'windows' ? EOL.CRLF : EOL.LF;
