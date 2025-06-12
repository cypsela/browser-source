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
  return new Promise<File>((resolve, reject) => fileEntry.file(resolve, reject));
}

export function getFsEntryKind(entry: FileSystemEntry): FileSystemHandleKind {
  return entry.isDirectory ? "directory" : "file";
}

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
