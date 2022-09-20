/** Contains options that control behavior when fetching a URL. */
export interface UrlOptions {
  url: string;
  fetchOptions?: RequestInit;
}

/** Contains options that control behavior of {@link downloadFile}. */
export interface DownloadOptions extends UrlOptions {
  /** The location where the file will be downloaded. Filename will be inferred if omitted. */
  downloadLocation: DownloadLocation;
  /** The file {@link Deno.OpenOptions.mode} to use when writing the downloaded file. */
  mode?: number;
}

/** Contains a literal or special directory and optional filename for use as a download target. */
export type DownloadLocation = (LiteralDirectory | SpecialDirectory) & {
  filename?: string;
};

interface LiteralDirectory {
  /**
   * Can be an absolute or relative path (relative paths resolved from current working directory).
   * Trailing slash is optional.
   */
  dir: string;
}
interface SpecialDirectory {
  specialDir: 'temp' | 'cwd';
}
