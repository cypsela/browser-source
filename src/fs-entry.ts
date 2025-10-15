import type {
  BrowserFsItemSourceOptions,
  BrowserFsItemSourceResult,
} from "./interface.js";
import { browserFsItemSource } from "./util.js";

// https://wicg.github.io/entries-api/#example-ee6569f7 in typescript
export async function* getDirEntryEntries(
  dirEntry: FileSystemDirectoryEntry,
): AsyncGenerator<FileSystemEntry> {
  const reader = dirEntry.createReader();
  const getNextBatch = () =>
    new Promise<FileSystemEntry[]>((resolve, reject) =>
      reader.readEntries(resolve, reject),
    );

  let entries: FileSystemEntry[];
  do {
    entries = await getNextBatch();
    for (const entry of entries) {
      yield entry;
    }
  } while (entries.length > 0); // loop until batch is empty
}

export async function getFileEntryFile(
  fileEntry: FileSystemFileEntry,
): Promise<File> {
  return new Promise<File>((resolve, reject) =>
    fileEntry.file(resolve, reject),
  );
}

export function getFsEntryKind(entry: FileSystemEntry): FileSystemHandleKind {
  return entry.isDirectory ? "directory" : "file";
}

/**
 * Takes a [FileSystemEntry](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry) and turns it into an
 * [ImportCandidateStream](https://ipfs.github.io/js-ipfs-unixfs/types/ipfs-unixfs-importer.index.ImportCandidateStream.html)
 * for importing into [@helia/unixfs](https://ipfs.github.io/helia/modules/_helia_unixfs.index.html).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_and_Directory_Entries_API
 *
 * @example
 * ```
 * import { fsEntrySource, BrowserFsItemSourceOptions } from '@cypsela/browser-source'
 * import { createHelia } from 'helia'
 * import { unixfs } from '@helia/unixfs'
 *
 * const helia = await createHelia()
 * const fs = unixfs(helia)
 *
 * const entry: FileSystemEntry = /* Get from drag-and-drop events *\/;
 *
 * for await (const { cid } of fs.addAll(fsEntrySource(entry))) {}
 * ```
 *
 * @param entry - [FileSystemEntry](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry)
 * @param options
 */
export function fsEntrySource(
  entry: FileSystemEntry,
  options?: BrowserFsItemSourceOptions,
): AsyncGenerator<BrowserFsItemSourceResult> {
  return browserFsItemSource(
    entry,
    getDirEntryEntries,
    getFileEntryFile,
    getFsEntryKind,
    options,
  );
}
