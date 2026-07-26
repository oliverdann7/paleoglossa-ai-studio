import { isCapacitor } from '../platform.js';

/**
 * Saves a generated file to the user's device.
 *
 * Web: classic anchor-with-download-attribute flow (same behavior as before).
 *
 * Native (Capacitor): WKWebView and Android WebView silently ignore the
 * `download` attribute on blob: URLs, so exports were no-ops in the apps.
 * Instead the file is written to the app cache and handed to the system
 * share sheet, which lets the user save it to Files/Drive or send it on.
 */
export async function downloadFile(
  filename: string,
  data: Blob | string,
  mimeType = 'application/octet-stream'
): Promise<void> {
  const blob = typeof data === 'string' ? new Blob([data], { type: mimeType }) : data;

  if (!isCapacitor()) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);

  const base64 = await blobToBase64(blob);
  const written = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  });

  try {
    await Share.share({ title: filename, url: written.uri });
  } catch (err: any) {
    // User dismissed the share sheet — not an error.
    if (!/cancel/i.test(String(err?.message ?? err ?? ''))) throw err;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      // result is a data: URL — strip the prefix to get raw base64.
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });
}
