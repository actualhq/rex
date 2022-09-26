import { stripSuffix } from '../lang/strings.ts';
import { checkExhaustive } from '../lang/types.ts';
import { fs, isNil, parseMediaType, path } from '../deps.ts';
import { DownloadLocation, DownloadOptions, UrlOptions } from './types.ts';

/**
 * Downloads a remote URL and writes the contents to a temp file. As with any temp file operations,
 * the caller is responsible for cleaning up the file when done using it.
 *
 * @param url The url of the file to download
 * @returns A {@link Promise<string>} containing the full path to the downloaded file
 */
export function downloadFileToTempDir(url: string): Promise<string> {
  return downloadFile({ url, downloadLocation: { specialDir: 'temp' } });
}

/**
 * Downloads a remote URL and writes the contents to disk.
 *
 * @param options The {@link DownloadOptions} specifying the download file and behavior
 * @returns A {@link Promise<string>} containing the full path to the downloaded file
 */
export async function downloadFile(options: DownloadOptions): Promise<string> {
  const blob = await openFileFromUrl(options);
  const downloadPath = await buildDownloadPath(options, blob.headers);
  const file = await Deno.open(downloadPath, { write: true, create: true, mode: options.mode });
  await blob.data.stream().pipeTo(file.writable);
  return downloadPath;
}

/**
 * Gets a {@link Blob} of a remote URL for stream reading.
 *
 * @param options The {@link DownloadOptions} specifying the download file and behavior
 * @returns A promise containing the {@link Blob} and {@link Headers} provided in the response
 */
export async function openFileFromUrl(
  options: UrlOptions,
): Promise<{ data: Blob; headers: Headers }> {
  const response = await fetch(options.url, options.fetchOptions);
  if (response.status !== 200) {
    const responseBody = await response.text();
    throw new Deno.errors.Http(
      `Download of ${options.url} failed with status ${response.status} - ${response.statusText}: '${responseBody}'`,
    );
  }
  return { data: await response.blob(), headers: response.headers };
}

async function buildDownloadPath(options: DownloadOptions, headers: Headers): Promise<string> {
  const downloadFilename = options.downloadLocation.filename ??
    determineDownloadFilename(options.url, headers);
  const downloadDir = await getDownloadDir(options.downloadLocation);

  await fs.ensureDir(downloadDir);

  if (!downloadFilename) {
    console.warn('Unable to infer filename from URL or headers, making one up.');
    // If there was no way to choose a filename, just make one up.
    return Deno.makeTempFile({ dir: downloadDir });
  } else {
    return path.join(downloadDir, downloadFilename);
  }
}

async function getDownloadDir(location: DownloadLocation): Promise<string> {
  if ('dir' in location) {
    return location.dir;
  } else {
    switch (location.specialDir) {
      case 'cwd':
        return Deno.cwd();
      case 'temp':
        return await Deno.makeTempDir({ prefix: 'deno_download' });
      default:
        return checkExhaustive(location.specialDir);
    }
  }
}

function determineDownloadFilename(url: string, headers: Headers): string {
  // If the response sets the Content-Disposition header, accept its suggested filename.
  const disposition = headers.get('content-disposition');
  if (!isNil(disposition)) {
    const filename = parseMediaType(disposition)[1]?.filename;
    if (filename) {
      return path.basename(filename);
    }
  }
  // If we didn't find a suggested filename, just use the last segment of the URL's path.
  const urlPath = new URL(url).pathname;
  return path.basename(stripSuffix(urlPath, '/'));
}
