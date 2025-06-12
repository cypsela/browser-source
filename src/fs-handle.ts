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
