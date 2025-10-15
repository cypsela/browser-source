import type {
  BrowserFsItemSourceOptions,
  BrowserFsItemSourceResult,
} from "./interface.js";
import { browserFsItemSource } from "./util.js";

export async function* getDirHandleEntries(
  dirHandle: FileSystemDirectoryHandle,
): AsyncGenerator<FileSystemHandle> {
  for await (const [_, handle] of dirHandle.entries()) {
    yield handle;
  }
}

export async function getFileHandleFile(
  fileHandle: FileSystemFileHandle,
): Promise<File> {
  return fileHandle.getFile();
}

export function getHandleKind(handle: FileSystemHandle): FileSystemHandleKind {
  return handle.kind;
}

/**
 * Takes a [FileSystemHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle) and turns it into an
 * [ImportCandidateStream](https://ipfs.github.io/js-ipfs-unixfs/types/ipfs-unixfs-importer.index.ImportCandidateStream.html)
 * for importing into [@helia/unixfs](https://ipfs.github.io/helia/modules/_helia_unixfs.index.html).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle
 *
 * @example
 * ```
 * import { fsHandleSource, BrowserFsItemSourceOptions } from '@cypsela/browser-source'
 * import { createHelia } from 'helia'
 * import { unixfs } from '@helia/unixfs'
 *
 * const helia = await createHelia()
 * const fs = unixfs(helia)
 *
 * const handle: FileSystemHandle = /* Get from drag-and-drop events *\/;
 *
 * for await (const { cid } of fs.addAll(fsHandleSource(handle))) {}
 * ```
 *
 * @param handle - [FileSystemHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle)
 * @param options
 */
export function fsHandleSource(
  handle: FileSystemHandle,
  options?: BrowserFsItemSourceOptions,
): AsyncGenerator<BrowserFsItemSourceResult> {
  return browserFsItemSource(
    handle,
    getDirHandleEntries,
    getFileHandleFile,
    getHandleKind,
    options,
  );
}
