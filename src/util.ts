import blobToIt from "blob-to-it";
import type { Mtime } from "ipfs-unixfs";
import { ImportCandidate } from "ipfs-unixfs-importer";
import type {
  BrowserFsDir,
  BrowserFsFile,
  BrowserFsItem,
  BrowserFsItemSourceOptions,
  BrowserFsItemSourceResult,
  GetEntries,
  GetFile,
  GetKind,
  IterableFile,
} from "./interface.js";

class DefaultIterableFile extends File implements IterableFile {
  constructor(
    blobParts: BlobPart[],
    fileName: string,
    options: FilePropertyBag,
  ) {
    super(blobParts, fileName, options);
  }

  [Symbol.asyncIterator](): AsyncIterator<Uint8Array> {
    return blobToIt(this)[Symbol.asyncIterator]();
  }
}

export const createIterableFile = (file: File): IterableFile =>
  new DefaultIterableFile([file], file.name, { type: file.type });

// https://github.com/ipfs/helia/blob/28a7091260fda1f711b93318084a65ff3d2f3f8a/packages/unixfs/src/utils/to-mtime.ts#L47-L52
export function msToMtime(ms: number): Mtime {
  const secs = Math.floor(ms / 1000);

  return {
    secs: BigInt(secs),
    nsecs: (ms - secs * 1000) * 1000,
  };
}

export function pickMtime(
  lastModified: File["lastModified"],
  options?: Pick<BrowserFsItemSourceOptions, "preserveMtime" | "mtime">,
): ImportCandidate["mtime"] {
  return options?.preserveMtime === true
    ? msToMtime(lastModified)
    : options?.mtime;
}

export function hasCommonRoot(
  items: FileList | FileSystemEntry[] | FileSystemHandle[],
): boolean {
  if (items.length === 0) {
    // no items = common root
    return true;
  }

  if (
    items[0] instanceof FileSystemEntry ||
    items[0] instanceof FileSystemHandle
  ) {
    // more than one item from the same directory = no common root
    return items.length === 1;
  }

  if (items instanceof FileList) {
    // directory uploads have multiple files from the same common root
    return items.length === 1 || items[0]!.webkitRelativePath.includes("/");
  }

  throw new TypeError("items type is not supported");
}

function isDirectory<T extends BrowserFsItem>(
  item: T,
  getKind: GetKind<T>,
): item is Extract<T, BrowserFsDir<T>> {
  return getKind(item) === "directory";
}

function isFile<T extends BrowserFsItem>(
  item: T,
  getKind: GetKind<T>,
): item is Extract<T, BrowserFsFile<T>> {
  return getKind(item) === "file";
}

export async function* browserFsItemSource<T extends BrowserFsItem>(
  item: T,
  getEntries: GetEntries<T>,
  getFile: GetFile<T>,
  getKind: GetKind<T>,
  options: BrowserFsItemSourceOptions = {},
): AsyncGenerator<BrowserFsItemSourceResult> {
  if (options.hidden !== true && item.name.startsWith(".")) {
    return;
  }

  const path = (options.prefix ?? "") + item.name;

  if (isDirectory(item, getKind)) {
    if (options.onlyFiles === true) {
      yield {
        path,
        content: undefined,
        mode: options.mode,
        mtime: options.mtime,
      };
    }

    for await (const entry of getEntries(item)) {
      options.prefix = `${path}/`;
      yield* browserFsItemSource(entry, getEntries, getFile, getKind, options);
    }
    return;
  }

  if (isFile(item, getKind)) {
    const file = await getFile(item);

    yield {
      path,
      content: createIterableFile(file),
      mode: options.mode,
      mtime: pickMtime(file.lastModified, options),
    };
    return;
  }

  throw new TypeError("Unsupported filesystem kind.");
}
