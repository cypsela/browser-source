import blobToIt from "blob-to-it";
import type { Mtime } from "ipfs-unixfs";
import type {
  BrowserFsDir,
  BrowserFsFile,
  BrowserFsItem,
  BrowserFsItemSourceOptions,
  BrowserFsItemSourceResult,
  GetEntries,
  GetFile,
  GetKind,
} from "./interface.js";

// https://github.com/ipfs/helia/blob/28a7091260fda1f711b93318084a65ff3d2f3f8a/packages/unixfs/src/utils/to-mtime.ts#L47-L52
function msToMtime(ms: number): Mtime {
  const secs = Math.floor(ms / 1000);

  return {
    secs: BigInt(secs),
    nsecs: (ms - secs * 1000) * 1000,
  };
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
  if (options.hidden === false && item.name.startsWith(".")) {
    return;
  }

  const path = (options.prefix ?? "") + item.name;

  if (isDirectory(item, getKind)) {
    if (!options.onlyFiles) {
      yield {
        path,
        content: undefined,
        mode: options.mode,
        mtime: options.mtime,
      };
    }

    for await (const entry of getEntries(item)) {
      options.prefix = path + "/";
      yield* browserFsItemSource(entry, getEntries, getFile, getKind, options);
    }
    return;
  }

  if (isFile(item, getKind)) {
    const file = await getFile(item);

    yield {
      path,
      content: blobToIt(file),
      mode: options.mode,
      mtime: options.preserveMtime
        ? msToMtime(file.lastModified)
        : options.mtime,
    };
    return;
  }

  throw new TypeError("Unsupported filesystem kind.");
}
